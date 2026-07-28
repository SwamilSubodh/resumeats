const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const env = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const { authenticate } = require("./middleware/authMiddleware");
const uploadResumeFile = require("./middleware/uploadMiddleware");
const resumeController = require("./controllers/resumeController");
const analysisController = require("./controllers/analysisController");
const notFoundMiddleware = require("./middleware/notFoundMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
});

const allowedOrigins = env.frontendUrl.split(",").map((item) => item.trim());

app.use(helmet());
app.use(compression());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/analyze", analysisRoutes);

// Root aliases required in the prompt.
app.post("/upload-resume", authenticate, uploadResumeFile, resumeController.uploadResume);
app.post("/analyze", authenticate, analysisController.analyzeResumeToJD);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
