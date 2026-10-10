const crypto = require("crypto");
const Otp = require("../models/Otp");

const MAX_OTP_ATTEMPTS = 5;

// cryptographically secure 6-digit code (Math.random is predictable)
const generateOtpCode = () => String(crypto.randomInt(100000, 1000000));

const sameCode = (a, b) => {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

// Checks the newest unexpired code of an e-mail. Wrong guesses are counted;
// after MAX_OTP_ATTEMPTS the codes of that e-mail are destroyed and a new one must be requested.
// Returns the matching Otp document, or null.
const checkOtp = async (email, code) => {
  const active = await Otp.findOne({ email, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
  if (!active) return null;

  if (active.attempts >= MAX_OTP_ATTEMPTS) {
    await Otp.deleteMany({ email });
    return null;
  }

  if (typeof code === "string" && sameCode(active.code, code.trim())) return active;

  active.attempts += 1;
  await active.save();
  if (active.attempts >= MAX_OTP_ATTEMPTS) await Otp.deleteMany({ email });
  return null;
};

// Was a code for this e-mail created within the last `seconds`?
const requestedRecently = async (email, seconds = 60) => {
  const recent = await Otp.findOne({ email }).sort({ createdAt: -1 });
  return !!recent && Date.now() - recent.createdAt.getTime() < seconds * 1000;
};

module.exports = { MAX_OTP_ATTEMPTS, generateOtpCode, checkOtp, requestedRecently };
