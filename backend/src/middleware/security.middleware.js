// Lightweight security middleware (no extra npm packages needed).

// Basic hardening headers, the most useful subset of what `helmet` sets.
const securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  }
  next();
};

// Looks for MongoDB operator injection such as { "email": { "$ne": null } } or keys like "a.b".
const containsOperatorKeys = (value, depth = 0) => {
  if (value === null || typeof value !== "object" || depth > 10) return false;
  if (Array.isArray(value)) return value.some((item) => containsOperatorKeys(item, depth + 1));

  return Object.keys(value).some(
    (key) => key.startsWith("$") || key.includes(".") || containsOperatorKeys(value[key], depth + 1)
  );
};

// Rejects (instead of silently rewriting) requests that try to smuggle query operators.
const blockOperatorInjection = (req, res, next) => {
  if (containsOperatorKeys(req.body) || containsOperatorKeys(req.query) || containsOperatorKeys(req.params)) {
    return res.status(400).json({ message: "Invalid characters in request" });
  }
  next();
};

module.exports = { securityHeaders, blockOperatorInjection, containsOperatorKeys };
