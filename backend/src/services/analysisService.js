const ApiError = require("../utils/ApiError");
const { preprocessText } = require("../utils/textUtils");
const { calculateTfidfCosineSimilarity } = require("./similarityService");
const { extractSkills } = require("./skillExtractionService");
const { generateSuggestions } = require("./suggestionService");
const { getSemanticSimilarity } = require("./semanticService");
const env = require("../config/env");

const { skillSynonyms, normalize } = require("../constants/skillSynonyms");
const axios = require("axios");
const levenshtein = require("fast-levenshtein");

// =========================
// SEMANTIC CACHE
// =========================
const semanticCache = new Map();
const CACHE_MAX_SIZE = 500;

// =========================
// Utility
// =========================
function clampScore(value) {
  return Math.max(0, Math.min(100, value));
}

function levenshteinSimilarity(a, b) {
  const dist = levenshtein.get(a, b);
  return 1 - dist / Math.max(a.length, b.length);
}

// =========================
// Metrics
// =========================
function calculateMetrics(matchedSkills, resumeSkills, jdSkills) {
  const precision = resumeSkills.length ? matchedSkills.length / resumeSkills.length : 0;
  const recall = jdSkills.length ? matchedSkills.length / jdSkills.length : 0;

  const f1Score =
    precision + recall ? (2 * precision * recall) / (precision + recall) : 0;

  const keywordCoverage = jdSkills.length ? matchedSkills.length / jdSkills.length : 0;

  return {
    precision: Number(precision.toFixed(4)),
    recall: Number(recall.toFixed(4)),
    f1Score: Number(f1Score.toFixed(4)),
    keywordCoverage: Number(keywordCoverage.toFixed(4))
  };
}

// =========================
// ML Service
// =========================
async function getMLScore(resumeText, jobDescription) {
  try {
    const res = await axios.post(
      `${env.mlServiceUrl}/predict`,
      { resume: resumeText, jd: jobDescription },
      { timeout: 3000 }
    );

    const raw = res.data.mlScore;
    return raw > 1 ? raw / 100 : raw;
  } catch (err) {
    console.warn("ML fallback:", err.message);
    return 0;
  }
}

// =========================
// Cached SBERT
// =========================
async function getCachedSemantic(resume, jd) {
  const key = resume.slice(0, 100) + jd.slice(0, 100);

  if (semanticCache.has(key)) return semanticCache.get(key);

  const score = await getSemanticSimilarity(resume, jd);

  if (semanticCache.size >= CACHE_MAX_SIZE) semanticCache.clear();
  semanticCache.set(key, score);

  return score;
}

// =========================
// Skill Expansion
// =========================
function expandSkills(skills) {
  const expanded = new Set();

  skills.forEach((skill) => {
    const norm = normalize(skill);
    expanded.add(norm);

    if (skillSynonyms[norm]) {
      skillSynonyms[norm].forEach((s) => expanded.add(s));
    }
  });

  return expanded;
}

// =========================
// Skill Inference
// =========================
function inferSkills(text) {
  const inferred = [];

  if (/manage|managed|managing/i.test(text)) inferred.push("leadership");
  if (/coordinate/i.test(text)) inferred.push("coordination");
  if (/database|records/i.test(text)) inferred.push("data management");
  if (/assist|support/i.test(text)) inferred.push("collaboration");
  if (/analyz|report/i.test(text)) inferred.push("data analysis");
  if (/design|develop/i.test(text)) inferred.push("software development");
  if (/train|mentor/i.test(text)) inferred.push("training delivery");
  if (/audit/i.test(text)) inferred.push("audit");
  if (/stakeholder/i.test(text)) inferred.push("stakeholder communication");
  if (/safety/i.test(text)) inferred.push("safety management");
  if (/compliance/i.test(text)) inferred.push("compliance");
  if (/train|mentor/i.test(text)) inferred.push("onboarding");
  if (/workflow|automation/i.test(text)) inferred.push("workflow automation");


if (/operations|process/i.test(text)) inferred.push("operations management");

  return inferred;
}

// =========================
// Skill Matching (FINAL)
// =========================
function matchSkill(jdNorm, expandedResume) {
  // 1. Exact
  if (expandedResume.has(jdNorm)) return true;

  for (const s of expandedResume) {
    // Skip very short terms
    if (s.length <= 4 || jdNorm.length <= 4) continue;

    // 2. Whole word match (safe substring)
    const whole = new RegExp(`(^|\\s)${jdNorm}(\\s|$)`);
    if (whole.test(s)) return true;

    // 3. Fuzzy match (strict threshold)
    if (levenshteinSimilarity(s, jdNorm) > 0.85) return true;
  }

  return false;
}

// =========================
// Dynamic Score
// =========================
function computeFinalScore({ mlScore, similarityScore, skillCoverageScore }) {
  let wML = 0.4;
  let wSim = 0.3;
  let wSkill = 0.3;

  if (mlScore > 0.8) {
    wML = 0.5; wSim = 0.25; wSkill = 0.25;
  }
  if (skillCoverageScore > 70) {
    wSkill += 0.1; wML -= 0.05; wSim -= 0.05;
  }
  if (similarityScore > 70) {
    wSim += 0.1; wML -= 0.05; wSkill -= 0.05;
  }

  const total = wML + wSim + wSkill;

  const score =
    (mlScore * 100 * wML +
      similarityScore * wSim +
      skillCoverageScore * wSkill) / total;

  return clampScore(Math.round(score));
}

// =========================
// MAIN FUNCTION
// =========================
async function analyzeResumeAgainstJD({ resumeText, jobDescription }) {
  if (!resumeText || !jobDescription) {
    throw new ApiError(400, "Both resumeText and jobDescription are required.");
  }

  const resumeProcessed = preprocessText(resumeText);
  const jdProcessed = preprocessText(jobDescription);

  const { cosineSimilarity, similarityScore } =
    calculateTfidfCosineSimilarity(
      resumeProcessed.filteredTokens,
      jdProcessed.filteredTokens
    );

  let semanticScoreRaw = 0;
  try {
    semanticScoreRaw = await getCachedSemantic(resumeText, jobDescription);
  } catch (err) {
    console.error("SBERT error:", err.message);
  }

  const semanticScore = Math.round(semanticScoreRaw * 100);

  const resumeSkills = extractSkills(resumeText);
  const jdSkills = extractSkills(jobDescription);

  const inferredSkills = inferSkills(resumeText);
  const expandedResume = expandSkills([...resumeSkills, ...inferredSkills]);

  const matchedSkills = [];
  const missingSkills = [];

  jdSkills.forEach((skill) => {
    const norm = normalize(skill);

    if (matchSkill(norm, expandedResume)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const metrics = calculateMetrics(matchedSkills, resumeSkills, jdSkills);
  const skillCoverageScore = Math.round(metrics.keywordCoverage * 100);

  const mlScore = await getMLScore(resumeText, jobDescription);

  const hybridSimilarity = Math.round(
    similarityScore * 0.4 + semanticScore * 0.6
  );

  const finalScore = computeFinalScore({
    mlScore,
    similarityScore: hybridSimilarity,
    skillCoverageScore
  });

  const suggestions = await generateSuggestions({
    missingSkills,
    resumeText,
    jobDescription,
    matchScore: finalScore
  });

  


  console.log("=== SKILL DEBUG ===");
  console.log("Resume skills (catalog):", resumeSkills);
  console.log("Inferred skills:", inferredSkills);
  console.log("Expanded resume set:", [...expandedResume]);
  console.log("JD skills:", jdSkills);
  console.log("Matched:", matchedSkills);
  console.log("Missing:", missingSkills);

  return {
    matchScore: finalScore,
    mlScore,
    cosineSimilarity,
    semanticScore,
    matchedSkills,
    missingSkills,
    inferredSkills,
    suggestions,
    metrics,
    scoreBreakdown: {
      ml: Math.round(mlScore * 100),
      tfidf: similarityScore,
      semantic: semanticScore,
      skills: skillCoverageScore
    },
    extractedSkills: {
      resume: resumeSkills,
      jobDescription: jdSkills
    }
  };
}

module.exports = {
  analyzeResumeAgainstJD
};