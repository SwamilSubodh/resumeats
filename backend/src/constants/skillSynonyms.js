// =========================
// Normalize helper
// IMPORTANT: Must match the same normalization used in analysisService
// and skillExtractionService — strips everything except a-z, 0-9, spaces.
// =========================
const normalize = (text = "") => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

// =========================
// Synonym Groups
// Each array = a set of equivalent terms.
// All entries are auto-mapped bidirectionally.
// =========================
const synonymGroups = [
  // Frontend
  ["react", "react.js", "reactjs"],
  ["node.js", "nodejs"],
  ["express", "express.js"],
  ["next.js", "nextjs"],
  ["vue", "vue.js"],
  ["angular", "angularjs"],

  // Cloud
  ["aws", "amazon web services"],
  ["gcp", "google cloud"],
  ["azure", "microsoft azure"],

  // Data / AI
  ["machine learning", "ml"],
  ["deep learning", "dl"],
  ["nlp", "natural language processing"],
  ["llm", "large language models"],
  ["scikit-learn", "sklearn"],
  ["tensorflow", "tf"],
  ["pytorch", "torch"],
  ["bert", "transformers"],
  ["openai api", "openai"],
  ["power bi", "powerbi"],
  ["tableau", "tableau software"],

  // Backend / Auth
  ["jwt", "json web token"],
  ["oauth", "oauth2"],
  ["rest api", "restful api", "rest"],

  // Soft skills
  ["leadership", "team management", "supervision", "mentoring"],
  ["communication", "client interaction", "coordination", "stakeholder communication"],
  ["problem solving", "analytical thinking", "critical thinking", "creative problem solving"],
  ["teamwork", "collaboration"],

  // Data / Business
  ["data analysis", "data analytics", "reporting", "operational data analysis"],
  ["data engineering", "data pipelines", "etl"],
  ["client management", "case management"],
  ["crm", "customer relationship management"],

  // Operations (FIX: explicit group so "safety management system"
  // does NOT bleed into "system design")
  ["operations management", "operational management", "operational workflows"],
  ["safety management", "safety management system", "safety procedures"],
  ["process improvement", "continuous improvement", "process optimization"],
  ["workflow automation", "automation", "process automation"],
  ["training delivery", "training design", "training curriculum"],
  ["audit", "internal audit", "compliance audit"],

  // System design — intentionally narrow, no "system" aliases
  ["system design", "systems design", "system architecture"],

  // Domain
  ["childcare", "child care"],
  ["special needs care", "special education"],
  ["behavioral therapy", "aba", "cbt"],
  ["care coordination", "client coordination"],

  // Business / Product
["project management", "project coordination", "project planning"],
["product management", "product ownership", "product strategy"],
["business analysis", "requirement analysis", "business requirements"],

// Marketing
["digital marketing", "online marketing"],
["seo", "search engine optimization"],
["sem", "search engine marketing"],

// Sales
["sales", "business development", "lead generation"],
["customer success", "client success"],

// HR
["recruitment", "talent acquisition", "hiring"],
["employee engagement", "team engagement"],

// Finance
["financial analysis", "financial modeling"],
["budgeting", "budget planning"],

// Education
["teaching", "instruction", "education delivery"],
["curriculum design", "course design"],

// Healthcare
["patient care", "patient support"],
["counseling", "therapy"],
["mental health support", "psychological support"],

// Soft Skills (more realistic)
["communication", "presentation", "public speaking"],
["leadership", "team leadership", "people management"],
["problem solving", "troubleshooting"],
["time management", "task management"],
["decision making", "strategic thinking"],

// Operations
["operations management", "operations"],
["process improvement", "process optimization"],
["quality assurance", "quality control"],
["compliance", "regulatory compliance"],

// 🔥 Cross-domain mapping (VERY IMPORTANT)

// Operations → Tech
["process improvement", "automation", "workflow automation"],
["operational workflows", "workflow automation"],
["data management", "data analysis"],
["reporting", "data analysis"],
["audit", "compliance"],
["internal audit", "compliance"],

// Training → Communication / onboarding
["training delivery", "onboarding"],
["training design", "onboarding"],
["mentoring", "onboarding"],

// Leadership → broader match
["team leadership", "leadership"],
["supervision", "leadership"],

// Soft skill alignment
["attention to detail", "quality assurance"],
["analytical skills", "data analysis"],

// 🔥 OPERATIONS → TECH BRIDGE (CRITICAL)

["process improvement", "automation", "workflow automation"],
["operational workflows", "workflow automation"],
["operations management", "process improvement"],
["workflow", "workflow automation"],

];

// =========================
// Build bidirectional map
// =========================
const skillSynonyms = {};

synonymGroups.forEach((group) => {
  const normalizedGroup = group.map(normalize);

  normalizedGroup.forEach((skill) => {
    skillSynonyms[skill] = normalizedGroup.filter((s) => s !== skill);
  });
});

module.exports = {
  skillSynonyms,
  normalize
};