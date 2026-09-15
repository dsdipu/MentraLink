const User = require("../models/User");
const Student = require("../models/Student");
const Mentor = require("../models/Mentor");
const { comparePassword } = require("../utils/hashPassword");
const generateToken = require("../utils/generateToken");
const { hashPassword } = require("../utils/hashPassword");

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await hashPassword(password);

    // Mentor/Student need admin approval; set isActive false by default for them
    const isActive = role === "ADMIN" ? true : false;

    const user = await User.create({ name, email, password: hashedPassword, role, isActive });

    res.status(201).json({
      message: isActive
        ? "Account created"
        : "Registration submitted. Waiting for admin approval.",
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Admin: approve pending mentor/student registration
const approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Create the matching profile document NOW, so admin lists/dashboards
    // reflect the new mentor/student immediately — don't wait for them to
    // visit their own Profile page.
    if (user.role === "STUDENT") {
      const existing = await Student.findOne({ user: user._id });
      if (!existing) {
        const count = await Student.countDocuments();
        await Student.create({
          user: user._id,
          studentId: `SWE${String(count + 1).padStart(3, "0")}`, // SWE001, SWE002, ...
          department: "",
          batch: "",
        });
      }
    } else if (user.role === "MENTOR") {
      const existing = await Mentor.findOne({ user: user._id });
      if (!existing) {
        await Mentor.create({ user: user._id, department: "" });
      }
    }

    res.json({ message: "User approved", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Admin: get all pending (unapproved) users
const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ isActive: false }).select("-password");
    res.json({ pendingUsers });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Admin: reject a pending registration (delete the user)
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