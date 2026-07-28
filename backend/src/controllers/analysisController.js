// const asyncHandler = require("../utils/asyncHandler");
// const ApiError = require("../utils/ApiError");
// const Analysis = require("../models/Analysis");
// const { analyzeResumeAgainstJD } = require("../services/analysisService");
// const { generateAnalysisPdf } = require("../services/reportService");

// const analyzeResumeToJD = asyncHandler(async (req, res) => {
//   const { resumeText, jobDescription } = req.body;

//   const analysisOutput = await analyzeResumeAgainstJD({
//     resumeText,
//     jobDescription
//   });

//   const savedAnalysis = await Analysis.create({
//     user: req.auth.user._id,
//     resumeText,
//     jobDescription,
//     matchScore: analysisOutput.matchScore,
//     cosineSimilarity: analysisOutput.cosineSimilarity,
//     matchedSkills: analysisOutput.matchedSkills,
//     missingSkills: analysisOutput.missingSkills,
//     suggestions: analysisOutput.suggestions,
//     metrics: analysisOutput.metrics
//   });

//   res.status(200).json({
//     id: savedAnalysis._id,
//     ...analysisOutput,
//     createdAt: savedAnalysis.createdAt
//   });
// });

// const getAnalysisHistory = asyncHandler(async (req, res) => {
//   const limit = Math.min(Number(req.query.limit || 20), 100);

//   const history = await Analysis.find({ user: req.auth.user._id })
//     .sort({ createdAt: -1 })
//     .limit(limit)
//     .select("matchScore cosineSimilarity matchedSkills missingSkills suggestions metrics createdAt");

//   res.status(200).json({
//     items: history
//   });
// });

// const getAnalysisById = asyncHandler(async (req, res) => {
//   const { analysisId } = req.params;
//   const analysis = await Analysis.findOne({ _id: analysisId, user: req.auth.user._id });

//   if (!analysis) {
//     throw new ApiError(404, "Analysis not found.");
//   }

//   res.status(200).json({ analysis });
// });

// const downloadAnalysisReport = asyncHandler(async (req, res) => {
//   const { analysisId } = req.params;
//   const analysis = await Analysis.findOne({ _id: analysisId, user: req.auth.user._id });

//   if (!analysis) {
//     throw new ApiError(404, "Analysis not found.");
//   }

//   const pdfBuffer = await generateAnalysisPdf(analysis);

//   res.setHeader("Content-Type", "application/pdf");
//   res.setHeader("Content-Disposition", `attachment; filename=analysis-${analysisId}.pdf`);
//   res.status(200).send(pdfBuffer);
// });

// module.exports = {
//   analyzeResumeToJD,
//   getAnalysisHistory,
//   getAnalysisById,
//   downloadAnalysisReport
// };




const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Analysis = require("../models/Analysis");
const { analyzeResumeAgainstJD } = require("../services/analysisService");
const { generateAnalysisPdf } = require("../services/reportService");

// Optional: normalization (if you want preprocessing here)
const { normalize } = require("../constants/skillSynonyms");

// 🔍 Helper: basic validation
const validateInput = (resumeText, jobDescription) => {
  if (!resumeText || !jobDescription) {
    throw new ApiError(400, "Resume text and Job Description are required.");
  }

  if (resumeText.length < 50) {
    throw new ApiError(400, "Resume content is too short.");
  }

  if (jobDescription.length < 50) {
    throw new ApiError(400, "Job description is too short.");
  }
};

// 🚀 MAIN ANALYSIS
const analyzeResumeToJD = asyncHandler(async (req, res) => {
  const { resumeText, jobDescription } = req.body;

  validateInput(resumeText, jobDescription);

  // Optional normalization (useful if your service doesn't already handle it)
  const normalizedResume = normalize(resumeText);
  const normalizedJD = normalize(jobDescription);

  const analysisOutput = await analyzeResumeAgainstJD({
    resumeText: normalizedResume,
    jobDescription: normalizedJD
  });

  // Defensive defaults (avoid undefined crashes)
  const {
    matchScore = 0,
    cosineSimilarity = 0,
    matchedSkills = [],
    missingSkills = [],
    suggestions = [],
    metrics = {}
  } = analysisOutput || {};

  const savedAnalysis = await Analysis.create({
    user: req.auth.user._id,
    resumeText,
    jobDescription,
    matchScore,
    cosineSimilarity,
    matchedSkills,
    missingSkills,
    suggestions,
    metrics,
    scoreBreakdown: analysisOutput.scoreBreakdown
  });

  res.status(200).json({
    id: savedAnalysis._id,
    matchScore,
    cosineSimilarity,
    matchedSkills,
    missingSkills,
    suggestions,
    metrics,
    scoreBreakdown: analysisOutput.scoreBreakdown,
    createdAt: savedAnalysis.createdAt
  });
});

// 📜 HISTORY
const getAnalysisHistory = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 20), 100);

  const history = await Analysis.find({ user: req.auth.user._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("matchScore cosineSimilarity matchedSkills missingSkills suggestions metrics  scoreBreakdown createdAt");

  res.status(200).json({
    count: history.length,
    items: history
  });
});

// 📄 SINGLE ANALYSIS
const getAnalysisById = asyncHandler(async (req, res) => {
  const { analysisId } = req.params;

  if (!analysisId) {
    throw new ApiError(400, "Analysis ID is required.");
  }

  const analysis = await Analysis.findOne({
    _id: analysisId,
    user: req.auth.user._id
  });

  if (!analysis) {
    throw new ApiError(404, "Analysis not found.");
  }

  res.status(200).json({ analysis });
});

// 📥 PDF DOWNLOAD
const downloadAnalysisReport = asyncHandler(async (req, res) => {
  const { analysisId } = req.params;

  if (!analysisId) {
    throw new ApiError(400, "Analysis ID is required.");
  }

  const analysis = await Analysis.findOne({
    _id: analysisId,
    user: req.auth.user._id
  });

  if (!analysis) {
    throw new ApiError(404, "Analysis not found.");
  }

  const pdfBuffer = await generateAnalysisPdf(analysis);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=analysis-${analysisId}.pdf`
  );

  res.status(200).send(pdfBuffer);
});

module.exports = {
  analyzeResumeToJD,
  getAnalysisHistory,
  getAnalysisById,
  downloadAnalysisReport
};
