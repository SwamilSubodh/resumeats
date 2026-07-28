const dotenv = require("dotenv");

dotenv.config();

function required(name, value) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const maxFileSizeMb = Number(process.env.MAX_FILE_SIZE_MB || 8);

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUri: required("MONGODB_URI", process.env.MONGODB_URI),
  jwtSecret: required("JWT_SECRET", process.env.JWT_SECRET),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  mlServiceUrl: process.env.ML_SERVICE_URL || "http://localhost:5001",
  maxFileSizeBytes: maxFileSizeMb * 1024 * 1024,
  // openAiApiKey: process.env.OPENAI_API_KEY || "",
  // openAiModel: process.env.OPENAI_MODEL || "gpt-4o-mini"
  groqApiKey: process.env.GROQ_API_KEY || "",
};

module.exports = env;
