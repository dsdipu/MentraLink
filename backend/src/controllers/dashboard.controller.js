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
const MentorshipGroup = require("../models/MentorshipGroup"); // already imported upore thakle abar lagbe na
const Feedback = require("../models/Feedback"); // Task 3-4 e banano model
const { calculateMentorRating } = require("../services/rating.service");

// Student: nijer dashboard summary
const getStudentDashboard = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    // student er group khuje ber kora
    const group = await MentorshipGroup.findOne({ students: student._id });

    // next upcoming session
    const nextSessionDoc = group
      ? await Session.findOne({
          group: group._id,
          status: "UPCOMING",
          date: { $gte: new Date() },
        }).sort({ date: 1 })
      : null;

    // attendance percentage
    const totalAttendance = await Attendance.countDocuments({ student: student._id });
    const presentAttendance = await Attendance.countDocuments({ student: student._id, status: "PRESENT" });
    const attendancePercent =
      totalAttendance > 0 ? +((presentAttendance / totalAttendance) * 100).toFixed(2) : 0;

    // pending feedback: completed session gula ja te ekhono feedback dey nai
    let pendingFeedback = 0;
    if (group) {
      const completedSessions = await Session.find({ group: group._id, status: "COMPLETED" }).select("_id");
      const givenFeedback = await Feedback.find({ student: student._id }).select("session");
      const givenSessionIds = givenFeedback.map((f) => f.session.toString());
      pendingFeedback = completedSessions.filter((s) => !givenSessionIds.includes(s._id.toString())).length;
    }

    res.json({
      nextSession: nextSessionDoc ? nextSessionDoc.title : null,
      attendancePercent,
      pendingFeedback,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Mentor: nijer dashboard summary
const getMentorDashboard = async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ user: req.user.id });
    if (!mentor) return res.status(404).json({ message: "Mentor profile not found" });

    const group = await MentorshipGroup.findOne({ mentor: mentor._id });
    const studentCount = group ? group.students.length : 0;

    const upcomingSessions = await Session.countDocuments({
      mentor: mentor._id,
      status: "UPCOMING",
      date: { $gte: new Date() },
    });

    const ratingData = await calculateMentorRating(mentor._id, null);

    res.json({
      studentCount,
      upcomingSessions,
      averageRating: ratingData.averageRating ?? ratingData.average ?? 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getAdminDashboard, getStudentDashboard, getMentorDashboard };