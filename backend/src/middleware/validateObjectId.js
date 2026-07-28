const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");

function validateObjectId(paramName = "id") {
  return (req, res, next) => {
    const value = req.params[paramName];

    if (!value) {
      return next(new ApiError(400, `Missing route parameter: ${paramName}`));
    }

    if (!mongoose.Types.ObjectId.isValid(value)) {
      return next(new ApiError(400, `Invalid ID format for parameter: ${paramName}`));
    }

    next();
  };
}

module.exports = validateObjectId;