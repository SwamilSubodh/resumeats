const env = require("../config/env");

const cloudSkills = new Set(["aws", "azure", "gcp", "docker", "kubernetes", "terraform"]);
const testingSkills = new Set(["jest", "cypress", "playwright", "selenium", "unit testing"]);

// =========================
// Prompt Builder
// =========================
function buildPrompt({ resumeText, jobDescription, missingSkills }) {
  return [
    "You are a senior recruiter and ATS optimization expert.",
    "Given a resume and job description, produce 3 concise, specific resume improvement suggestions.",
    "Each suggestion must be a single sentence and actionable.",
    "Return ONLY a numbered list (1. 2. 3.) with no extra text or preamble.",
    `Missing skills detected: ${missingSkills.join(", ") || "none"}`,
    "Resume:",
    resumeText.slice(0, 3500),
    "Job Description:",
    jobDescription.slice(0, 3500)
  ].join("\n\n");
}

// =========================
// Response Parser
// =========================
function parseBulletLines(text = "") {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*\d.\s]+/, "").trim())
    .filter(Boolean);
}

// Env   : GROQ_API_KEY
// =========================
async function callGroq({ resumeText, jobDescription, missingSkills }) {
  if (!env.groqApiKey) return [];

  const prompt = buildPrompt({ resumeText, jobDescription, missingSkills });

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.groqApiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 256,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq API error: ${response.status} — ${err}`);
    }

    const data = await response.json();
    const outputText = data?.choices?.[0]?.message?.content || "";

    return parseBulletLines(outputText).slice(0, 3);
  } catch (error) {
    console.warn("Groq suggestion failed:", error.message);
    return [];
  }
}

// =========================
// AI Suggestions — Priority:
// 1. Gemini  (if GEMINI_API_KEY set)
// 2. Groq    (if GROQ_API_KEY set)
// 3. Skip    (no key → rule-based only)
// =========================
async function buildAiSuggestions(payload) {

  if (env.groqApiKey) {
    return await callGroq(payload);
  }

  console.info("No AI API key configured. Using rule-based suggestions only.");
  return [];
}

// =========================
// Rule-Based Suggestions
// =========================
function buildRuleBasedSuggestions({ missingSkills, resumeText, matchScore }) {
  const suggestions = [];

  if (missingSkills.length) {
    suggestions.push(
      `Add projects or achievements that demonstrate: ${missingSkills.slice(0, 5).join(", ")}.`
    );
  }

  const missingCloud = missingSkills.filter((skill) => cloudSkills.has(skill));
  if (missingCloud.length) {
    suggestions.push(
      "Include cloud/deployment experience with quantified impact (cost, uptime, performance)."
    );
  }

  const missingTesting = missingSkills.filter((skill) => testingSkills.has(skill));
  if (missingTesting.length) {
    suggestions.push(
      "Show testing ownership by listing frameworks used and test coverage or defect reduction outcomes."
    );
  }

  if (!/\b\d+(%|\+|x|k|m)?\b/i.test(resumeText)) {
    suggestions.push(
      "Add measurable outcomes (percentages, latency cuts, revenue impact, user growth) to each major bullet."
    );
  }

  if (!/(projects|experience|skills|education|summary)/i.test(resumeText)) {
    suggestions.push(
      "Use ATS-friendly sections like Summary, Skills, Experience, Projects, and Education."
    );
  }

  if (matchScore < 55) {
    suggestions.push(
      "Rewrite the professional summary to mirror core JD keywords naturally in the first 5-7 lines."
    );
  }

  return suggestions;
}

// =========================
// Main Export
// =========================
async function generateSuggestions(payload) {
  const ruleBased = buildRuleBasedSuggestions(payload);
  const aiSuggestions = await buildAiSuggestions(payload);

  const merged = [...ruleBased, ...aiSuggestions];
  const unique = [];

  for (const item of merged) {
    if (!item) continue;

    if (!unique.some((existing) => existing.toLowerCase() === item.toLowerCase())) {
      unique.push(item);
    }
  }

  return unique.slice(0, 6);
}

module.exports = {
  generateSuggestions
};