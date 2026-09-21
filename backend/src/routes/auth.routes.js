const express = require("express");
const router = express.Router();
const {
  login,
  register,
  approveUser,
  getPendingUsers,
  rejectUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const verificationUpload = require("../middleware/verificationUpload.middleware");
const { loginLimiter, otpRequestLimiter, otpVerifyLimiter } = require("../middleware/rateLimit.middleware");

router.post("/register", verificationUpload.single("idCardImage"), register);
router.post("/login", loginLimiter, login);
router.post("/forgot-password", otpRequestLimiter, forgotPassword);
router.post("/reset-password", otpVerifyLimiter, resetPassword);

router.get("/pending", protect, authorize("ADMIN"), getPendingUsers);
router.get("/pending-count", protect, authorize("ADMIN"), getPendingCount);
router.patch("/approve/:id", protect, authorize("ADMIN"), approveUser);
router.delete("/reject/:id", protect, authorize("ADMIN"), rejectUser);

module.exports = router;