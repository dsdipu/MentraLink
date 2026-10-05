const Student = require("../models/Student");
const User = require("../models/User");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const Mentor = require("../models/Mentor");
const MentorshipGroup = require("../models/MentorshipGroup");
const { rejectWeakPassword } = require("../utils/passwordPolicy");
const {
  MAX_BULK,
  isValidStudentId,
  normalizeDomain,
  getDefaultDomain,
  buildEmail,
  findTakenIds,
  createTemporaryStudent,
  bulkCreateStudents: runBulkCreate,
} = require("../services/accountCreation.service");

// Admin: create ONE student.
// - without a password: temporary credentials (email = ID + domain, password = ID, must change on first login)
// - with a password: that password, which has to satisfy the strong password policy
const createStudent = async (req, res) => {
  try {
    const { name, password, studentId, department, batch } = req.body;
    let { email } = req.body;

    if (!name || !String(name).trim()) return res.status(400).json({ message: "Name is required" });
    if (!isValidStudentId(studentId)) {
      return res.status(400).json({ message: "Student ID must be 9 digits" });
    }
    const cleanId = String(studentId).trim();

    if (!email) {
      const domain = getDefaultDomain();
      if (!domain) return res.status(400).json({ message: "Email is required" });
      email = buildEmail(cleanId, domain);
    }
    email = String(email).toLowerCase().trim();

    const taken = await findTakenIds([cleanId], normalizeDomain(email.split("@")[1]) || getDefaultDomain() || "@x.invalid");
    const emailUsed = await User.exists({ email });
    if (taken.has(cleanId) || emailUsed) {
      return res.status(409).json({ message: "This student ID or email is already registered" });
    }

    if (!password) {
      const user = await createTemporaryStudent({
        studentId: cleanId,
        name: String(name).trim(),
        email,
        department: department || "",
      });
      const student = await Student.findOne({ user: user._id }).populate("user", "name email isActive");
      return res.status(201).json({
        student,
        temporaryCredentials: { email, password: cleanId },
      });
    }

    if (rejectWeakPassword(res, password, { email, name })) return;
    const { hashPassword } = require("../utils/hashPassword");
    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name: String(name).trim(),
      email,
      password: hashedPassword,
      role: "STUDENT",
      submittedStudentId: cleanId,
      batch: batch || cleanId.slice(0, 3),
    });
    let student;
    try {
      student = await Student.create({
        user: user._id,
        studentId: cleanId,
        department,
        batch: batch || cleanId.slice(0, 3),
      });
    } catch (err) {
      await User.deleteOne({ _id: user._id });
      throw err;
    }

    res.status(201).json({ student });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

// Admin: create many students from an ID range (e.g. 262034001 .. 262034035).
// IDs that are already registered are skipped, the rest get temporary credentials.
const bulkCreateStudents = async (req, res) => {
  try {
    const { startId, endId, department, emailDomain } = req.body;
    const result = await runBulkCreate({ startId, endId, department, emailDomain });
    res.status(result.status).json(result.body);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

// Admin: default email domain + limits for the bulk form
const getBulkConfig = (req, res) => {
  res.json({ emailDomain: getDefaultDomain() || "", maxPerRequest: MAX_BULK });
};

const getStudents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.batch) filter.batch = req.query.batch;
    if (req.query.studentId) filter.studentId = { $regex: req.query.studentId, $options: "i" };

    const students = await Student.find(filter).populate("user", "name email isActive");
    res.json({ students });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("user", "name email isActive");
    if (!student) return res.status(404).json({ message: "Student not found" });

    // contact details are private: a student can open only their own record,
    // a mentor only the students of their own groups
    if (req.user.role === "STUDENT" && String(student.user?._id) !== String(req.user.id)) {
      return res.status(403).json({ message: "You can only view your own profile" });
    }
    if (req.user.role === "MENTOR") {
      const mentor = await Mentor.findOne({ user: req.user.id }).select("_id");
      const shared = mentor
        ? await MentorshipGroup.exists({ mentor: mentor._id, students: student._id })
        : null;
      if (!shared) return res.status(403).json({ message: "This student is not in your groups" });
    }

    res.json({ student });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
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
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
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
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
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
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
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
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
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

    const student = await Student.findOneAndUpdate(
      { user: req.user.id },
      { profileImage: result.secure_url },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    res.json({ profileImage: student.profileImage });
  } catch (err) {
    console.error("Student photo upload error:", err);
    res.status(500).json({
      message: "Profile image upload failed",
      error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
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
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
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
  bulkCreateStudents,
  getBulkConfig,
};