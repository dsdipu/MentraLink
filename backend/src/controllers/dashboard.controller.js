const Student = require("../models/Student");
const Mentor = require("../models/Mentor");
const MentorshipGroup = require("../models/MentorshipGroup");
const Session = require("../models/Session");
const Attendance = require("../models/Attendance");
const MentorEvaluation = require("../models/MentorEvaluation");

const getAdminDashboard = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalMentors = await Mentor.countDocuments();
    const activeGroups = await MentorshipGroup.countDocuments({ status: "ACTIVE" });
    const totalSessions = await Session.countDocuments();

    // Attendance statistics
    const totalAttendanceRecords = await Attendance.countDocuments();
    const presentCount = await Attendance.countDocuments({ status: "PRESENT" });
    const attendanceRate =
      totalAttendanceRecords > 0
        ? +((presentCount / totalAttendanceRecords) * 100).toFixed(2)
        : 0;

    // Average mentor rating (across all evaluations, all mentors)
    const evaluations = await MentorEvaluation.find();
    let averageMentorRating = 0;
    if (evaluations.length > 0) {
      const totalOverall = evaluations.reduce((sum, ev) => {
        const avg =
          (ev.ratings.communication +
            ev.ratings.guidance +
            ev.ratings.availability +
            ev.ratings.knowledgeSharing +
            ev.ratings.overallExperience) /
          5;
        return sum + avg;
      }, 0);
      averageMentorRating = +(totalOverall / evaluations.length).toFixed(2);
    }

    // Recent sessions (last 5, most recent first)
    const recentSessions = await Session.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title date status");

    res.json({
      totalStudents,
      totalMentors,
      activeGroups,
      totalSessions,
      attendanceStatistics: {
        totalRecords: totalAttendanceRecords,
        presentCount,
        attendanceRate: `${attendanceRate}%`,
      },
      averageMentorRating,
      recentActivities: recentSessions,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getAdminDashboard };