const Attendance = require("../models/Attendance");

// Mentor: mark attendance for multiple students in a session
const markAttendance = async (req, res) => {
  try {
    const { sessionId, records } = req.body;
    // records = [{ student: "<id>", status: "PRESENT" }, ...]

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
    const records = await Attendance.find({ session: sessionId })
      .populate({ path: "student", populate: { path: "user", select: "name email" } });

    res.json({ records });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { markAttendance, getMyAttendance, getAttendanceStats, getSessionAttendance };