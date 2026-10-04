const Attendance = require("../models/Attendance");
const Mentor = require("../models/Mentor");
const MentorshipGroup = require("../models/MentorshipGroup");

// Mentor: mark attendance for multiple students in a session
const markAttendance = async (req, res) => {
  try {
    const { sessionId, records } = req.body;
    // records = [{ student: "<id>", status: "PRESENT" }, ...]

    if (!sessionId || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "Session and attendance records are required" });
    }

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (req.user.role === "MENTOR") {
      const mentor = await Mentor.findOne({ user: req.user.id }).select("_id");
      if (!mentor || session.mentor.toString() !== mentor._id.toString()) {
        return res.status(403).json({ message: "You can only mark attendance for your own sessions" });
      }
    }

    if (session.status !== "COMPLETED") {
      return res.status(400).json({ message: "Attendance can only be marked for completed sessions" });
    }

    // only students that really belong to this session's section, with a valid status
    const group = await MentorshipGroup.findById(session.group).select("students");
    const groupStudentIds = new Set((group?.students || []).map((id) => id.toString()));
    for (const record of records) {
      if (!record || !groupStudentIds.has(String(record.student))) {
        return res.status(400).json({ message: "Attendance contains a student who is not in this section" });
      }
      if (!["PRESENT", "ABSENT"].includes(record.status)) {
        return res.status(400).json({ message: "Attendance status must be PRESENT or ABSENT" });
      }
    }

    const results = [];
    for (const record of records) {
      const attendance = await Attendance.findOneAndUpdate(
        { session: sessionId, student: record.student },
        { status: record.status },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      results.push(attendance);
    }

    res.status(201).json({ attendance: results });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { markAttendance };
const Student = require("../models/Student");
const Session = require("../models/Session");

// Student: to see all my attendance record
const getMyAttendance = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const records = await Attendance.find({ student: student._id })
      .populate("session", "title date sessionNumber")
      .sort({ createdAt: -1 });

    res.json({ records });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Student: own attendance percentage / stats
const getAttendanceStats = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const total = await Attendance.countDocuments({ student: student._id });
    const present = await Attendance.countDocuments({ student: student._id, status: "PRESENT" });
    const absent = total - present;
    const percentage = total > 0 ? +((present / total) * 100).toFixed(2) : 0;

    res.json({ present, absent, total, percentage });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Mentor/Admin: for session full attendance sheet
const getSessionAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (req.user.role === "MENTOR") {
      const [session, mentor] = await Promise.all([
        Session.findById(sessionId).select("mentor"),
        Mentor.findOne({ user: req.user.id }).select("_id"),
      ]);
      if (!session) return res.status(404).json({ message: "Session not found" });
      if (!mentor || session.mentor.toString() !== mentor._id.toString()) {
        return res.status(403).json({ message: "You can only view attendance of your own sessions" });
      }
    }

    const records = await Attendance.find({ session: sessionId })
      .populate({ path: "student", populate: { path: "user", select: "name email" } });

    res.json({ records });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { markAttendance, getMyAttendance, getAttendanceStats, getSessionAttendance };