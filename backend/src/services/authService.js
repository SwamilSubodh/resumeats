const jwt = require("jsonwebtoken");
const ms = require("ms");
const { v4: uuidv4 } = require("uuid");

const env = require("../config/env");
const UserSession = require("../models/UserSession");

function getSessionExpiryDate() {
  const ttlMs = ms(env.jwtExpiresIn) || ms("7d");
  return new Date(Date.now() + ttlMs);
}

async function issueSessionToken(user, requestMeta = {}) {
  const tokenId = uuidv4();
  const expiresAt = getSessionExpiryDate();

  await UserSession.create({
    user: user._id,
    tokenId,
    userAgent: requestMeta.userAgent || "",
    ipAddress: requestMeta.ipAddress || "",
    expiresAt
  });

  const token = jwt.sign(
    {
      sub: String(user._id),
      email: user.email,
      jti: tokenId
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

  return {
    token,
    expiresAt,
    tokenId
  };
}

async function revokeSession(tokenId) {
  if (!tokenId) {
    return;
  }

  await UserSession.deleteOne({ tokenId });
}

module.exports = {
  issueSessionToken,
  revokeSession
};
