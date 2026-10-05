const jwt = require("jsonwebtoken");
const User = require("../models/User");

// While a temporary password is still active, only these endpoints may be used
const ALLOWED_WHILE_TEMPORARY = ["/api/auth/change-password", "/api/auth/me"];

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  let decoded;
  try {
    decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }

  try {
    // always trust the database for role / active state, not only the token
    const user = await User.findById(decoded.id).select("role isActive passwordChangedAt mustChangePassword");
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Account is not active" });
    }

    // a password change/reset logs out every older session
    if (user.passwordChangedAt && decoded.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)) {
      return res.status(401).json({ message: "Password was changed, please log in again" });
    }

    if (user.mustChangePassword) {
      const path = req.originalUrl.split("?")[0].replace(/\/+$/, "");
      if (!ALLOWED_WHILE_TEMPORARY.includes(path)) {
        return res.status(403).json({
          code: "PASSWORD_CHANGE_REQUIRED",
          message: "Please change your temporary password first",
        });
      }
    }

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = protect;
