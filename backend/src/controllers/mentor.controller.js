const Mentor = require("../models/Mentor");
const User = require("../models/User");
const { hashPassword } = require("../utils/hashPassword");
const MentorshipGroup = require("../models/MentorshipGroup");
const Attendance = require("../models/Attendance");
const Blog = require("../models/Blog");
const uploadToCloudinary = require("../utils/cloudinaryUpload");

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

const getMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find().populate("user", "name email isActive");
    res.json({ mentors });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getMentorById = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id).populate("user", "name email isActive");
    if (!mentor) return res.status(404).json({ message: "Mentor not found" });
    res.json({ mentor });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateMentor = async (req, res) => {
  try {
    const { name, email, mentorStudentId, department, batch } = req.body;
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) return res.status(404).json({ message: "Mentor not found" });

    if (name !== undefined || email !== undefined) {
      const userUpdate = {};
      if (name !== undefined) userUpdate.name = name;
      if (email !== undefined) userUpdate.email = email.toLowerCase().trim();
      await User.findByIdAndUpdate(mentor.user, userUpdate);
    }

    if (mentorStudentId !== undefined) mentor.mentorStudentId = mentorStudentId;
    if (department !== undefined) mentor.department = department;
    if (batch !== undefined) mentor.batch = batch;
    await mentor.save();

    const updated = await Mentor.findById(mentor._id).populate("user", "name email isActive");
    res.json({ mentor: updated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "That email is already in use" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

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

const getMyProfile = async (req, res) => {
  try {
    const mentor = await Mentor.findOneAndUpdate(
      { user: req.user.id },
      { $setOnInsert: { user: req.user.id, department: "" } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate("user", "name email");

    const blogs = await Blog.find({ author: req.user.id }).select("likes");
    const totalLikes = blogs.reduce((sum, b) => sum + (b.likes?.length || 0), 0);

    res.json({
      name: mentor.user.name,
      email: mentor.user.email,
      phone: mentor.phone,
      department: mentor.department,
      expertise: mentor.expertise,
      status: mentor.status,
      totalLikes,
      mentorStudentId: mentor.mentorStudentId,
      batch: mentor.batch,
      profileImage: mentor.profileImage || null,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const { phone, department, expertise } = req.body;
    const mentor = await Mentor.findOneAndUpdate(
      { user: req.user.id },
      { phone, department, expertise },
      { new: true }
    ).populate("user", "name email");

    if (!mentor) return res.status(404).json({ message: "Mentor profile not found" });

    const blogs = await Blog.find({ author: req.user.id }).select("likes");
    const totalLikes = blogs.reduce((sum, b) => sum + (b.likes?.length || 0), 0);

    res.json({
      name: mentor.user.name,
      email: mentor.user.email,
      phone: mentor.phone,
      department: mentor.department,
      expertise: mentor.expertise,
      status: mentor.status,
      totalLikes,
      mentorStudentId: mentor.mentorStudentId,
      batch: mentor.batch,
      profileImage: mentor.profileImage || null,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const uploadMyPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      "mentralink/profiles",
      [{ width: 500, height: 500, crop: "fill" }]
    );

    const mentor = await Mentor.findOneAndUpdate(
      { user: req.user.id },
      { profileImage: result.secure_url },
      { new: true }
    );

    if (!mentor) {
      return res.status(404).json({ message: "Mentor profile not found" });
    }

    res.json({ profileImage: mentor.profileImage });
  } catch (err) {
    console.error("Mentor photo upload error:", err);
    res.status(500).json({
      message: "Profile image upload failed",
      error: err.message,
    });
  }
};

const removeMyPhoto = async (req, res) => {
  try {
    const mentor = await Mentor.findOneAndUpdate(
      { user: req.user.id },
      { profileImage: "" },
      { new: true }
    );

    if (!mentor) return res.status(404).json({ message: "Mentor profile not found" });

    res.json({ message: "Photo removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getMyStudents = async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ user: req.user.id });
    if (!mentor) return res.status(404).json({ message: "Mentor profile not found" });

    const groups = await MentorshipGroup.find({ mentor: mentor._id, status: "ACTIVE" })
      .populate("semester", "name")
      .populate({
        path: "students",
        populate: { path: "user", select: "name email" },
      });

    const students = [];

    for (const group of groups) {
      for (const student of group.students) {
        if (!student.user) continue;

        const totalAttendance = await Attendance.countDocuments({ student: student._id });
        const presentCount = await Attendance.countDocuments({
          student: student._id,
          status: "PRESENT",
        });

        const attendancePercent =
          totalAttendance > 0
            ? +((presentCount / totalAttendance) * 100).toFixed(2)
            : null;

        students.push({
          _id: student._id,
          name: student.user.name,
          email: student.user.email,
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
  uploadMyPhoto,
  removeMyPhoto,
  getMyStudents,
};