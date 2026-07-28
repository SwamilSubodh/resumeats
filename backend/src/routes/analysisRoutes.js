// const express = require("express");

// const { authenticate } = require("../middleware/authMiddleware");
// const analysisController = require("../controllers/analysisController");

// const router = express.Router();

// router.post("/", authenticate, analysisController.analyzeResumeToJD);
// router.get("/history", authenticate, analysisController.getAnalysisHistory);
// router.get("/:analysisId", authenticate, analysisController.getAnalysisById);
// router.get("/:analysisId/report", authenticate, analysisController.downloadAnalysisReport);

// module.exports = router;


const express = require("express");

const { authenticate } = require("../middleware/authMiddleware");
const analysisController = require("../controllers/analysisController");

// Optional middlewares (recommended)
const validateObjectId = require("../middleware/validateObjectId");
const rateLimiter = require("../middleware/rateLimiter");

const router = express.Router();

// 🔍 Analyze Resume vs JD
router.post(
  "/",
  authenticate,
  rateLimiter, // prevent spam / abuse
  analysisController.analyzeResumeToJD
);

// 📜 Get history
router.get(
  "/history",
  authenticate,
  analysisController.getAnalysisHistory
);

// 📄 Get single analysis
router.get(
  "/:analysisId",
  authenticate,
  validateObjectId("analysisId"),
  analysisController.getAnalysisById
);

// 📥 Download PDF report
router.get(
  "/:analysisId/report",
  authenticate,
  validateObjectId("analysisId"),
  analysisController.downloadAnalysisReport
);

module.exports = router;
