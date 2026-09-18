const express = require("express");
const router = express.Router();
const { requestOtp, verifyOtp } = require("../controllers/otp.controller");
const { otpRequestLimiter, otpVerifyLimiter } = require("../middleware/rateLimit.middleware");

router.post("/request", otpRequestLimiter, requestOtp);
router.post("/verify", otpVerifyLimiter, verifyOtp);

module.exports = router;