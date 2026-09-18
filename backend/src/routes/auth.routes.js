const express = require("express");
const router = express.Router();
const { login, register, approveUser, getPendingUsers, rejectUser } = require("../controllers/auth.controller");
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const verificationUpload = require("../middleware/verificationUpload.middleware");
const { loginLimiter } = require("../middleware/rateLimit.middleware");

router.post("/register", verificationUpload.single("idCardImage"), register);
router.post("/login", loginLimiter, login);

router.get("/pending", protect, authorize("ADMIN"), getPendingUsers);
router.patch("/approve/:id", protect, authorize("ADMIN"), approveUser);
router.delete("/reject/:id", protect, authorize("ADMIN"), rejectUser);

module.exports = router;