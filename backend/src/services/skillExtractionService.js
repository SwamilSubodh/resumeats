const skillsCatalog = require("../constants/skillsCatalog");
const { normalizeText } = require("../utils/textUtils");

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildSkillPattern(skill) {
  const normalizedSkill = normalizeText(skill);
  const escaped = escapeRegex(normalizedSkill).replace(/\s+/g, "\\s+");

  // FIX: Use word boundaries (\b) instead of just whitespace anchors.
  // The old pattern (^|\s)skill(?=\s|$) was matching "system design"
  // inside "safety management system design" because "system design"
  // appeared as a substring after a space.
  // \b ensures we only match standalone skill phrases, not fragments
  // embedded inside longer domain-specific terms.
  return new RegExp(`\\b${escaped}\\b`, "i");
}

const skillPatterns = skillsCatalog.map((skill) => ({
  skill,
  pattern: buildSkillPattern(skill)
}));

// =========================
// Ambiguous skills that are too generic to extract reliably from
// free-form text — they produce too many false positives because
// their tokens appear naturally inside unrelated phrases.
//
// Examples:
//   "system design"  → matches "Safety Management System Design"
//   "design"         → matches almost any sentence
//
// These skills are still matchable via synonym expansion in
// analysisService when explicitly inferred or catalog-confirmed
// from a more specific context.
// =========================
const AMBIGUOUS_SKILLS = new Set([
  "system design",
  "design",
  "development",
  "management",
  "analysis"
]);

function extractSkills(rawText = "") {
  const normalized = normalizeText(rawText);

  if (!normalized) return [];

  const found = new Set();

  for (const item of skillPatterns) {
    // Skip ambiguous skills — too many false positives in free-form text
    if (AMBIGUOUS_SKILLS.has(item.skill.toLowerCase())) continue;

    if (item.pattern.test(normalized)) {
      found.add(item.skill);
    }
  }

  return Array.from(found).sort((a, b) => a.localeCompare(b));
}

// Available for standalone use — includes inferred skills on top of catalog
function extractAdvancedSkills(text) {
  const baseSkills = extractSkills(text);
  const inferred = [];

  if (/manage|managed|managing/i.test(text))  inferred.push("leadership");
  if (/coordinate|coordinated/i.test(text))   inferred.push("communication");
  if (/analyz|analysis/i.test(text))          inferred.push("data analysis");
  if (/design|develop/i.test(text))           inferred.push("software development");

  return Array.from(new Set([...baseSkills, ...inferred]));
}

module.exports = {
  extractSkills,         // plain catalog (used by analysisService)
  extractAdvancedSkills  // catalog + inference (for standalone use)
};