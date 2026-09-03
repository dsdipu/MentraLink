const Mentor = require("../models/Mentor");
const User = require("../models/User");
const { hashPassword } = require("../utils/hashPassword");
const MentorshipGroup = require("../models/MentorshipGroup");
const Attendance = require("../models/Attendance");

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

// Mentor: get own profile
const getMyProfile = async (req, res) => {
  try {
    const mentor = await Mentor.findOneAndUpdate(
      { user: req.user.id },
      { $setOnInsert: { user: req.user.id, department: "" } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate("user", "name email");

    res.json({
      name: mentor.user.name,
      email: mentor.user.email,
      phone: mentor.phone,
      department: mentor.department,
      expertise: mentor.expertise,
      status: mentor.status,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Mentor: update own profile (phone, department, expertise only)
const updateMyProfile = async (req, res) => {
  try {
    const { phone, department, expertise } = req.body;
    const mentor = await Mentor.findOneAndUpdate(
      { user: req.user.id },
      { phone, department, expertise },
      { new: true }
    ).populate("user", "name email");
    if (!mentor) return res.status(404).json({ message: "Mentor profile not found" });

    res.json({
      name: mentor.user.name,
      email: mentor.user.email,
      phone: mentor.phone,
      department: mentor.department,
      expertise: mentor.expertise,
      status: mentor.status,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Mentor: get all students across their active groups, with attendance %
const getMyStudents = async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ user: req.user.id });
    if (!mentor) return res.status(404).json({ message: "Mentor profile not found" });

    const groups = await MentorshipGroup.find({ mentor: mentor._id, status: "ACTIVE" })
      .populate("semester", "name")
      .populate({ path: "students", populate: { path: "user", select: "name email" } });

    const students = [];
    for (const group of groups) {
      for (const student of group.students) {
        const totalAttendance = await Attendance.countDocuments({ student: student._id });
        const presentCount = await Attendance.countDocuments({ student: student._id, status: "PRESENT" });
        const attendancePercent =
          totalAttendance > 0 ? +((presentCount / totalAttendance) * 100).toFixed(2) : null;

        students.push({
          _id: student._id,
          name: student.user?.name,
          email: student.user?.email,
          semester: group.semester?.name,
          attendancePercent,
        });
      }
    }

    res.json({ students });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createMentor,
  getMentors,
  getMentorById,
  updateMentor,
  toggleMentorStatus,
  getMyProfile,
  updateMyProfile,
  getMyStudents,
};