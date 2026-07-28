const express = require("express");

const { authenticate } = require("../middleware/authMiddleware");
const uploadResumeFile = require("../middleware/uploadMiddleware");
const resumeController = require("../controllers/resumeController");

const router = express.Router();

router.post("/upload-resume", authenticate, uploadResumeFile, resumeController.uploadResume);

module.exports = router;
