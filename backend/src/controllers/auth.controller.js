const User = require("../models/User");
const Student = require("../models/Student");
const Mentor = require("../models/Mentor");
const Otp = require("../models/Otp");
const { comparePassword, hashPassword } = require("../utils/hashPassword");
const generateToken = require("../utils/generateToken");

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    let derivedStudentId, batch;

    if (role === "STUDENT" || role === "MENTOR") {
      const allowedDomain = process.env.ALLOWED_STUDENT_EMAIL_DOMAIN;
      if (allowedDomain && !normalizedEmail.endsWith(allowedDomain.toLowerCase())) {
        return res.status(400).json({
          message: `Please register with your university email (must end with ${allowedDomain})`,
        });
      }

      // student ID is derived from the email itself: XXXYYYZZZ@domain
      const localPart = normalizedEmail.split("@")[0];
      const idMatch = localPart.match(/^(\d{3})(\d{3})(\d{3})$/);
      if (!idMatch) {
        return res.status(400).json({
          message: "Your university email doesn't match the expected student ID format (9 digits before @)",
        });
      }
      derivedStudentId = localPart;
      batch = idMatch[1];

      if (!req.file) {
        return res.status(400).json({ message: "A photo of your student ID card is required" });
      }

      const duplicateId = await User.findOne({ submittedStudentId: derivedStudentId });
      if (duplicateId) {
        return res.status(400).json({ message: "This student ID has already been registered" });
      }

      const verifiedOtp = await Otp.findOne({
        email: normalizedEmail,
        verified: true,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 });

      if (!verifiedOtp) {
        return res.status(400).json({ message: "Please verify your email with the code sent to you before registering" });
      }
    }

    const hashedPassword = await hashPassword(password);
    const isActive = role === "ADMIN" ? true : false;

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      isActive,
      submittedStudentId: derivedStudentId,
      batch,
      idCardImage: role === "STUDENT" || role === "MENTOR" ? req.file?.path : undefined,
    });

    await Otp.deleteMany({ email: normalizedEmail });

    res.status(201).json({
      message: isActive ? "Account created" : "Registration submitted. Waiting for admin approval.",
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "STUDENT") {
      const existing = await Student.findOne({ user: user._id });
      if (!existing) {
        let studentId = user.submittedStudentId;
        if (!studentId) {
          const count = await Student.countDocuments();
          studentId = `SWE${String(count + 1).padStart(3, "0")}`;
        }
        await Student.create({
          user: user._id,
          studentId,
          department: "Software Engineering",
          batch: user.batch || "",
        });
      }
    } else if (user.role === "MENTOR") {
      const existing = await Mentor.findOne({ user: user._id });
      if (!existing) {
        await Mentor.create({
          user: user._id,
          mentorStudentId: user.submittedStudentId || "",
          department: "Software Engineering",
          batch: user.batch || "",
        });
      }
    }

    res.json({ message: "User approved", user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "That student ID is already in use by another account" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ isActive: false }).select("-password");
    res.json({ pendingUsers });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isActive) {
      return res.status(400).json({ message: "Cannot reject an already active user" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Registration rejected and removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = generateToken(user._id, user.role);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // don't reveal whether the email exists — respond the same either way
    if (user && user.isActive) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      await Otp.create({
        email: normalizedEmail,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      const sendEmail = require("../utils/sendEmail");
      await sendEmail({
        to: normalizedEmail,
        subject: "Reset your MentraLink password",
        html: `
          <div style="font-family: sans-serif;">
            <p>Your password reset code is:</p>
            <h2 style="letter-spacing:6px;">${code}</h2>
            <p style="color:#666;font-size:13px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });
    }

    res.json({ message: "If that email is registered, a reset code has been sent." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const otp = await Otp.findOne({
      email: normalizedEmail,
      code,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otp) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ message: "Account not found" });

    user.password = await hashPassword(newPassword);
    await user.save();

    await Otp.deleteMany({ email: normalizedEmail });

    res.json({ message: "Password updated. You can now log in." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { login, register, approveUser, getPendingUsers, rejectUser, forgotPassword, resetPassword };