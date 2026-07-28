const bcrypt = require("bcryptjs");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");
const { issueSessionToken, revokeSession } = require("../services/authService");

function getRequestMeta(req) {
  return {
    userAgent: req.get("user-agent") || "",
    ipAddress: req.ip || req.socket?.remoteAddress || ""
  };
}

function validateAuthInput({ name, email, password }, isRegister = false) {
  if (!email || !password || (isRegister && !name)) {
    throw new ApiError(400, "Required fields are missing.");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format.");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long.");
  }
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  validateAuthInput({ name, email, password }, true);

  const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name: String(name).trim(),
    email: String(email).toLowerCase().trim(),
    passwordHash
  });

  const session = await issueSessionToken(user, getRequestMeta(req));

  res.status(201).json({
    user: user.toJSON(),
    token: session.token,
    expiresAt: session.expiresAt
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  validateAuthInput({ email, password });

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const validPassword = await user.comparePassword(password);
  if (!validPassword) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const session = await issueSessionToken(user, getRequestMeta(req));

  res.status(200).json({
    user: user.toJSON(),
    token: session.token,
    expiresAt: session.expiresAt
  });
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json({ user: req.auth.user });
});

const logout = asyncHandler(async (req, res) => {
  await revokeSession(req.auth.tokenId);
  res.status(200).json({ message: "Logged out successfully." });
});

module.exports = {
  register,
  login,
  me,
  logout
};
