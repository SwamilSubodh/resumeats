const multer = require("multer");
const path = require("path");

const env = require("../config/env");
const ApiError = require("../utils/ApiError");

const storage = multer.memoryStorage();

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname || "").toLowerCase();
  const isDocxByExt = ext === ".docx";

  if (allowedMimeTypes.has(file.mimetype) || isDocxByExt) {
    return cb(null, true);
  }

  return cb(new ApiError(400, "Unsupported file type. Only PDF and DOCX are allowed."));
}

const upload = multer({
  storage,
  limits: {
    fileSize: env.maxFileSizeBytes,
    files: 1
  },
  fileFilter
});

module.exports = upload.single("resume");
