const Mentor = require("../models/Mentor");
const User = require("../models/User");
const { hashPassword } = require("../utils/hashPassword");

// Admin: create mentor (creates User + Mentor together)
const createMentor = async (req, res) => {
  try {
    const { name, email, password, mentorStudentId, department } = req.body;

    const hashedPassword = await hashPassword(password);
    const user = await User.create({ name, email, password: hashedPassword, role: "MENTOR" });
    const mentor = await Mentor.create({ user: user._id, mentorStudentId, department });

    res.status(201).json({ mentor });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Admin/Mentor: get all mentors
const getMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find().populate("user", "name email isActive");
    res.json({ mentors });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get single mentor
const getMentorById = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id).populate("user", "name email isActive");
    if (!mentor) return res.status(404).json({ message: "Mentor not found" });
    res.json({ mentor });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Admin: update mentor
const updateMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!mentor) return res.status(404).json({ message: "Mentor not found" });
    res.json({ mentor });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Admin: activate/deactivate mentor
const toggleMentorStatus = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) return res.status(404).json({ message: "Mentor not found" });

    mentor.status = mentor.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await mentor.save();

    const user = await User.findById(mentor.user);
    user.isActive = mentor.status === "ACTIVE";
    await user.save();

    res.json({ message: `Mentor ${mentor.status === "ACTIVE" ? "activated" : "deactivated"}` });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { createMentor, getMentors, getMentorById, updateMentor, toggleMentorStatus };