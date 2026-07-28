const { removeStopwords, eng } = require("stopword");

function normalizeWhitespace(text = "") {
  return String(text).replace(/\s+/g, " ").trim();
}

function normalizeText(text = "") {
  const lowered = normalizeWhitespace(text).toLowerCase();

  // Keep symbols that matter for technical skills (c++, c#, node.js).
  return lowered
    .replace(/[^a-z0-9\s+#.\-/]/g, " ")
    .replace(/[\-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text = "") {
  const normalized = normalizeText(text);
  const tokens = normalized.match(/[a-z0-9+#.]+/g) || [];
  return tokens.filter((token) => token.length > 1 || token === "c");
}

function preprocessText(text = "") {
  const normalized = normalizeText(text);
  const tokens = tokenize(normalized);
  const filteredTokens = removeStopwords(tokens, eng);

  return {
    normalizedText: normalized,
    tokens,
    filteredTokens
  };
}

module.exports = {
  normalizeWhitespace,
  normalizeText,
  tokenize,
  preprocessText
};
