const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const ApiError = require("../utils/ApiError");
const { normalizeWhitespace } = require("../utils/textUtils");

async function parseResumeBuffer(file) {
  if (!file || !file.buffer) {
    throw new ApiError(400, "Resume file is required.");
  }

  const mime = (file.mimetype || "").toLowerCase();
  let extractedText = "";

  if (mime === "application/pdf") {
    const pdfData = await pdfParse(file.buffer);
    extractedText = pdfData.text || "";
  } else if (
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    String(file.originalname || "").toLowerCase().endsWith(".docx")
  ) {
    const docResult = await mammoth.extractRawText({ buffer: file.buffer });
    extractedText = docResult.value || "";
  } else {
    throw new ApiError(400, "Unsupported resume format. Upload PDF or DOCX.");
  }

  const cleanedText = normalizeWhitespace(extractedText);

  if (!cleanedText) {
    throw new ApiError(400, "Could not extract readable text from the uploaded resume.");
  }

  return cleanedText;
}

module.exports = {
  parseResumeBuffer
};
