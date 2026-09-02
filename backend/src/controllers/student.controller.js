// const Student = require("../models/Student");
// const User = require("../models/User");

// // Admin: create student (creates User + Student together)
// const createStudent = async (req, res) => {
//   try {
//     const { name, email, password, studentId, department, batch } = req.body;

//     const { hashPassword } = require("../utils/hashPassword");
//     const hashedPassword = await hashPassword(password);

//     const user = await User.create({ name, email, password: hashedPassword, role: "STUDENT" });
//     const student = await Student.create({ user: user._id, studentId, department, batch });

//     res.status(201).json({ student });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // Admin: get all students
// const getStudents = async (req, res) => {
//   try {
//     const students = await Student.find().populate("user", "name email isActive");
//     res.json({ students });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // Get single student
// const getStudentById = async (req, res) => {
//   try {
//     const student = await Student.findById(req.params.id).populate("user", "name email isActive");
//     if (!student) return res.status(404).json({ message: "Student not found" });
//     res.json({ student });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // Admin: update student
// const updateStudent = async (req, res) => {
//   try {
//     const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!student) return res.status(404).json({ message: "Student not found" });
//     res.json({ student });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // Admin: activate/deactivate student
// const toggleStudentStatus = async (req, res) => {
//   try {
//     const student = await Student.findById(req.params.id);
//     if (!student) return res.status(404).json({ message: "Student not found" });

//     const user = await User.findById(student.user);
//     user.isActive = !user.isActive;
//     await user.save();

//     res.json({ message: `Student ${user.isActive ? "activated" : "deactivated"}` });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// module.exports = { createStudent, getStudents, getStudentById, updateStudent, toggleStudentStatus };




const Student = require("../models/Student");
const User = require("../models/User");

// Admin: create student (creates User + Student together)
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

// Admin: get all students
const getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate("user", "name email isActive");
    res.json({ students });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get single student
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("user", "name email isActive");
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ student });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Admin: update student
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ student });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Admin: activate/deactivate student
const toggleStudentStatus = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const user = await User.findById(student.user);
    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `Student ${user.isActive ? "activated" : "deactivated"}` });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Student: get own profile
const getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id }).populate("user", "name email");
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    res.json({
      name: student.user.name,
      email: student.user.email,
      phone: student.phone,
      department: student.department,
      studentId: student.studentId,
      batch: student.batch,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Student: update own profile (phone, department only — studentId/batch are admin-managed)
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
    });
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
};