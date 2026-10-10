const Mentor = require("../models/Mentor");
const User = require("../models/User");
const { hashPassword } = require("../utils/hashPassword");
const { rejectWeakPassword } = require("../utils/passwordPolicy");
const audit = require("../utils/audit");
const {
  isValidStudentId,
  getDefaultDomain,
  buildEmail,
} = require("../services/accountCreation.service");
const MentorshipGroup = require("../models/MentorshipGroup");
const Attendance = require("../models/Attendance");
const Blog = require("../models/Blog");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const Student = require("../models/Student");
const { calculateMentorRating } = require("../services/rating.service");

// Admin: create ONE mentor.
// - without a password: temporary credentials (email = ID + domain, password = ID, must change on first login)
// - with a password: that password, which has to satisfy the strong password policy
const createMentor = async (req, res) => {
  try {
    const { name, password, mentorStudentId, department, expertise } = req.body;
    let { email } = req.body;

    if (!name || !String(name).trim()) return res.status(400).json({ message: "Name is required" });
    if (!department || !String(department).trim()) {
      return res.status(400).json({ message: "Department is required" });
    }

    const cleanId = String(mentorStudentId ?? "").trim();
    if (!password && !isValidStudentId(cleanId)) {
      return res.status(400).json({ message: "A 9-digit student ID is required to create temporary credentials" });
    }
    if (cleanId && !isValidStudentId(cleanId)) {
      return res.status(400).json({ message: "Student ID must be 9 digits" });
    }

    if (!email) {
      const domain = getDefaultDomain();
      if (!domain || !cleanId) return res.status(400).json({ message: "Email is required" });
      email = buildEmail(cleanId, domain);
    }
    email = String(email).toLowerCase().trim();

    const [emailUsed, idUsed] = await Promise.all([
      User.exists({ email }),
      cleanId
        ? Promise.all([
            User.exists({ submittedStudentId: cleanId }),
            Mentor.exists({ mentorStudentId: cleanId }),
            Student.exists({ studentId: cleanId }),
          ]).then((found) => found.some(Boolean))
        : false,
    ]);
    if (emailUsed || idUsed) {
      return res.status(409).json({ message: "This student ID or email is already registered" });
    }

    const temporary = !password;
    if (!temporary && rejectWeakPassword(res, password, { email, name })) return;

    const hashedPassword = temporary
      ? await hashPassword(cleanId, 10)
      : await hashPassword(password);

    const user = await User.create({
      name: String(name).trim(),
      email,
      password: hashedPassword,
      role: "MENTOR",
      submittedStudentId: cleanId || undefined,
      batch: cleanId ? cleanId.slice(0, 3) : undefined,
      mustChangePassword: temporary,
    });

    let mentor;
    try {
      mentor = await Mentor.create({
        user: user._id,
        mentorStudentId: cleanId || undefined,
        batch: cleanId ? cleanId.slice(0, 3) : "",
        department: String(department).trim(),
        expertise: expertise ? String(expertise).trim() : undefined,
      });
    } catch (err) {
      await User.deleteOne({ _id: user._id });
      throw err;
    }

    await audit(req, "MENTOR_CREATED", { target: `${cleanId || "-"} (${email})`, details: { temporary } });

    res.status(201).json({
      mentor,
      ...(temporary ? { temporaryCredentials: { email, password: cleanId } } : {}),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

const getMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find().populate("user", "name email isActive");
    const validMentors = mentors.filter((m) => m.user); // drop any with a missing/deleted linked User
    res.json({ mentors: validMentors });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

// Student: the mentor of the student's active group, with contact details and rating
const getMyMentor = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id }).select("_id");
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const group = await MentorshipGroup.findOne({ students: student._id, status: "ACTIVE" })
      .populate({ path: "mentor", populate: { path: "user", select: "name email isActive" } })
      .populate("semester", "name");

    if (!group || !group.mentor || !group.mentor.user) {
      return res.json({ mentor: null, group: group ? { _id: group._id, name: group.name } : null });
    }

    const mentor = group.mentor;
    const rating = await calculateMentorRating(mentor._id);

    res.json({
      group: { _id: group._id, name: group.name, semester: group.semester?.name || "" },
      mentor: {
        _id: mentor._id,
        name: mentor.user.name,
        email: mentor.user.email,
        phone: mentor.phone || "",
        department: mentor.department || "",
        expertise: mentor.expertise || "",
        batch: mentor.batch || "",
        profileImage: mentor.profileImage || null,
        rating: {
          overallRating: rating.overallRating,
          totalEvaluations: rating.totalEvaluations,
          categoryAverages: rating.categoryAverages,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

const getMentorById = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id).populate("user", "name email isActive");
    if (!mentor) return res.status(404).json({ message: "Mentor not found" });

    // email/phone are personal: a mentor sees only their own record,
    // a student only the mentor of their own group
    if (req.user.role === "MENTOR" && String(mentor.user?._id) !== String(req.user.id)) {
      return res.status(403).json({ message: "You can only view your own mentor profile" });
    }
    if (req.user.role === "STUDENT") {
      const student = await Student.findOne({ user: req.user.id }).select("_id");
      const group = student
        ? await MentorshipGroup.findOne({ students: student._id, mentor: mentor._id })
        : null;
      if (!group) return res.status(403).json({ message: "This is not your assigned mentor" });
    }

    res.json({ mentor });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
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
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
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
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
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
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
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
      error: process.env.NODE_ENV === "production" ? undefined : err.message,
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
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
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
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
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
  getMyMentor,
};