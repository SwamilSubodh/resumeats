const jwt = require("jsonwebtoken");

const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");
const UserSession = require("../models/UserSession");

function extractBearerToken(authHeader = "") {
  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice(7).trim();
}

async function authenticate(req, res, next) {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return next(new ApiError(401, "Authentication token missing."));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);

    const session = await UserSession.findOne({
      user: payload.sub,
      tokenId: payload.jti,
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      return next(new ApiError(401, "Session expired or invalid."));
    }

    const user = await User.findById(payload.sub).select("_id name email");
    if (!user) {
      return next(new ApiError(401, "User no longer exists."));
    }

    req.auth = {
      token,
      tokenId: payload.jti,
      user
    };

    session.lastActiveAt = new Date();
    await session.save();

    return next();
  } catch (error) {
    return next(new ApiError(401, "Invalid authentication token."));
  }
}

module.exports = {
  authenticate
};
