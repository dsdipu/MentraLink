const Student = require("../models/Student");
const User = require("../models/User");

const createStudent = async (req, res) => {
  try {
    const { name, email, password, studentId, department, batch } = req.body;
    const { hashPassword } = require("../utils/hashPassword");
    const hashedPassword = await hashPassword(password);

    const user = await User.create({ name, email, password: hashedPassword, role: "STUDENT" });
    const student = await Student.create({ user: user._id, studentId, department, batch });

    res.status(201).json({ student });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getStudents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.batch) filter.batch = req.query.batch;
    if (req.query.studentId) filter.studentId = { $regex: req.query.studentId, $options: "i" };

    const students = await Student.find(filter).populate("user", "name email isActive");
    res.json({ students });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("user", "name email isActive");
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ student });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { name, email, studentId, department, batch, phone } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (name !== undefined || email !== undefined) {
      const userUpdate = {};
      if (name !== undefined) userUpdate.name = name;
      if (email !== undefined) userUpdate.email = email.toLowerCase().trim();
      await User.findByIdAndUpdate(student.user, userUpdate);
    }

    if (studentId !== undefined) student.studentId = studentId;
    if (department !== undefined) student.department = department;
    if (batch !== undefined) student.batch = batch;
    if (phone !== undefined) student.phone = phone;
    await student.save();

    const updated = await Student.findById(student._id).populate("user", "name email isActive");
    res.json({ student: updated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "That email or student ID is already in use" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const toggleStudentStatus = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const user = await User.findById(student.user);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `Student ${user.isActive ? "activated" : "deactivated"}` });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { user: req.user.id },
      { $setOnInsert: { user: req.user.id, studentId: `PENDING-${req.user.id}`, department: "", batch: "" } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate("user", "name email");

    res.json({
      name: student.user.name,
      email: student.user.email,
      phone: student.phone,
      department: student.department,
      studentId: student.studentId,
      batch: student.batch,
      profileImage: student.profileImage || null,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const { phone, department } = req.body;

    

    const student = await Student.findOneAndUpdate(
      { user: req.user.id },
      { phone, department },
      { new: true }
    ).populate("user", "name email");

    if (!student) return res.status(404).json({ message: "Student profile not found" });

    res.json({
      name: student.user.name,
      email: student.user.email,
      phone: student.phone,
      department: student.department,
      studentId: student.studentId,
      batch: student.batch,
      profileImage: student.profileImage || null,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const uploadMyPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image uploaded" });
    const student = await Student.findOneAndUpdate(
      { user: req.user.id },
      { profileImage: req.file.path },
      { new: true }
    );
    if (!student) return res.status(404).json({ message: "Student profile not found" });
    res.json({ profileImage: student.profileImage });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const removeMyPhoto = async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { user: req.user.id },
      { profileImage: "" },
      { new: true }
    );
    if (!student) return res.status(404).json({ message: "Student profile not found" });
    res.json({ message: "Photo removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  toggleStudentStatus,
  getMyProfile,
  updateMyProfile,
  uploadMyPhoto,
  removeMyPhoto,
};