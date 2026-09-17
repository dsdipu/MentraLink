const User = require("../models/User");
const Student = require("../models/Student");
const Mentor = require("../models/Mentor");
const { comparePassword, hashPassword } = require("../utils/hashPassword");
const generateToken = require("../utils/generateToken");

const register = async (req, res) => {
  try {
    const { name, email, password, role, studentId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // ---- Student verification checks ----
    if (role === "STUDENT") {
      const allowedDomain = process.env.ALLOWED_STUDENT_EMAIL_DOMAIN;
      if (allowedDomain && !email.toLowerCase().endsWith(allowedDomain.toLowerCase())) {
        return res.status(400).json({
          message: `Students must register with their university email (must end with ${allowedDomain})`,
        });
      }

      if (!studentId || !studentId.trim()) {
        return res.status(400).json({ message: "University student ID is required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "A photo of your student ID card is required" });
      }

      const duplicateId = await User.findOne({ submittedStudentId: studentId.trim(), role: "STUDENT" });
      if (duplicateId) {
        return res.status(400).json({ message: "This student ID has already been registered" });
      }
    }

    const hashedPassword = await hashPassword(password);
    const isActive = role === "ADMIN" ? true : false;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isActive,
      submittedStudentId: role === "STUDENT" ? studentId.trim() : undefined,
      idCardImage: role === "STUDENT" ? req.file?.path : undefined,
    });

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
        // use their real, submitted university ID rather than a generated one
        let studentId = user.submittedStudentId;
        if (!studentId) {
          const count = await Student.countDocuments();
          studentId = `SWE${String(count + 1).padStart(3, "0")}`; // fallback for legacy/edge cases
        }
        await Student.create({ user: user._id, studentId, department: "", batch: "" });
      }
    } else if (user.role === "MENTOR") {
      const existing = await Mentor.findOne({ user: user._id });
      if (!existing) {
        await Mentor.create({ user: user._id, department: "" });
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
    const user = await User.findOne({ email });
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

module.exports = { login, register, approveUser, getPendingUsers, rejectUser };