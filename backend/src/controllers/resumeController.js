const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { parseResumeBuffer } = require("../services/resumeParserService");

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Resume file is required in 'resume' form-data field.");
  }

  const resumeText = await parseResumeBuffer(req.file);

  res.status(200).json({
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
    resumeText,
    extractedChars: resumeText.length
  });
});

module.exports = {
  uploadResume
};
