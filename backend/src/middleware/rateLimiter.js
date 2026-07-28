const ApiError = require("../utils/ApiError");

// =========================
// In-memory rate limiter
// No extra packages needed
// =========================

// Stores: { ip -> { count, windowStart } }
const requestMap = new Map();

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 10;      // max 10 analysis requests per minute per IP

// Clean up stale entries every 5 minutes to prevent memory growth
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestMap.entries()) {
    if (now - data.windowStart > WINDOW_MS) {
      requestMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

function rateLimiter(req, res, next) {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "unknown";

  const now = Date.now();
  const entry = requestMap.get(ip);

  // First request from this IP, or window has expired — reset
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    requestMap.set(ip, { count: 1, windowStart: now });
    return next();
  }

  // Within window — check count
  if (entry.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000);
    res.set("Retry-After", String(retryAfter));
    return next(new ApiError(429, `Too many requests. Please try again in ${retryAfter} seconds.`));
  }

  entry.count += 1;
  next();
}

module.exports = rateLimiter;