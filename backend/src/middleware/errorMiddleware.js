const ApiError = require("../utils/ApiError");
const env = require("../config/env");

function errorMiddleware(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error?.name === "MulterError") {
    const uploadError = new ApiError(400, error.message || "File upload failed.");
    return res.status(uploadError.statusCode).json({ message: uploadError.message });
  }

  if (error?.name === "CastError") {
    return res.status(400).json({ message: "Invalid resource identifier." });
  }

  const statusCode = error instanceof ApiError ? error.statusCode : 500;

  const payload = {
    message: error.message || "Internal Server Error"
  };

  if (error instanceof ApiError && error.details) {
    payload.details = error.details;
  }

  if (env.nodeEnv !== "production") {
    payload.stack = error.stack;
  }

  return res.status(statusCode).json(payload);
}

module.exports = errorMiddleware;
