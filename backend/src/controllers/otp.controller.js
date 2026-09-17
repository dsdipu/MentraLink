const Otp = require("../models/Otp");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "This email is already registered" });
    }

    const recent = await Otp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
    if (recent && Date.now() - recent.createdAt.getTime() < 60 * 1000) {
      return res.status(429).json({ message: "Please wait a minute before requesting another code" });
    }

    const code = generateCode();
    await Otp.create({
      email: normalizedEmail,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendEmail({
      to: normalizedEmail,
      subject: "Your MentraLink verification code",
      html: `
        <div style="font-family: sans-serif;">
          <p>Your MentraLink verification code is:</p>
          <h2 style="letter-spacing:6px;">${code}</h2>
          <p style="color:#666;font-size:13px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    res.json({ message: "Verification code sent to your email" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send verification email", error: err.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const otp = await Otp.findOne({
      email: normalizedEmail,
      code,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otp) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    otp.verified = true;
    await otp.save();

    res.json({ verified: true });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { requestOtp, verifyOtp };