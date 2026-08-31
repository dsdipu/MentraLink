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