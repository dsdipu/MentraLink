const User = require("../models/User");
const Semester = require("../models/Semester");
const Student = require("../models/Student");
const Mentor = require("../models/Mentor");
const MentorshipGroup = require("../models/MentorshipGroup");
const Session = require("../models/Session");
const Attendance = require("../models/Attendance");
const MentorEvaluation = require("../models/MentorEvaluation");
const Feedback = require("../models/Feedback");
const Blog = require("../models/Blog");
const { calculateMentorRating } = require("../services/rating.service");

const startOfToday = () => new Date(new Date().setHours(0, 0, 0, 0));

const getAdminDashboard = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalMentors = await Mentor.countDocuments();
    const activeGroups = await MentorshipGroup.countDocuments({ status: "ACTIVE" });
    const totalSessions = await Session.countDocuments();

    const totalAttendanceRecords = await Attendance.countDocuments();
    const presentCount = await Attendance.countDocuments({ status: "PRESENT" });
    const attendanceRate =
      totalAttendanceRecords > 0 ? +((presentCount / totalAttendanceRecords) * 100).toFixed(2) : 0;

    const evaluations = await MentorEvaluation.find();
    let averageMentorRating = 5.0;
    if (evaluations.length > 0) {
      const totalOverall = evaluations.reduce((sum, ev) => {
        const avg =
          (ev.ratings.communication + ev.ratings.guidance + ev.ratings.availability +
            ev.ratings.knowledgeSharing + ev.ratings.overallExperience) / 5;
        return sum + avg;
      }, 0);
      averageMentorRating = +(totalOverall / evaluations.length).toFixed(2);
    }

    const recentSessions = await Session.find().sort({ createdAt: -1 }).limit(5).select("title date status");

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
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

const getStudentDashboard = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const group = await MentorshipGroup.findOne({ students: student._id, status: "ACTIVE" });

    const nextSession = group
      ? await Session.findOne({
          group: group._id,
          status: "UPCOMING",
          date: { $gte: startOfToday() },
        }).sort({ date: 1 })
      : null;

    const totalAttendance = await Attendance.countDocuments({ student: student._id });
    const presentCount = await Attendance.countDocuments({ student: student._id, status: "PRESENT" });
    const attendancePercent =
      totalAttendance > 0 ? +((presentCount / totalAttendance) * 100).toFixed(2) : 0;

    const completedSessions = group
      ? await Session.countDocuments({ group: group._id, status: "COMPLETED" })
      : 0;
    const submittedFeedbackCount = (
      await Feedback.find({ student: student._id }).distinct("session")
    ).length;
    const pendingFeedback = Math.max(completedSessions - submittedFeedbackCount, 0);

    res.json({
      nextSession: nextSession?.title || null,
      nextSessionDate: nextSession?.date || null,
      attendancePercent,
      pendingFeedback,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

const getMentorDashboard = async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ user: req.user.id });
    if (!mentor) return res.status(404).json({ message: "Mentor profile not found" });

    const groups = await MentorshipGroup.find({ mentor: mentor._id, status: "ACTIVE" });
    const groupIds = groups.map((g) => g._id);

    const studentCount = groups.reduce((sum, g) => sum + (g.students?.length || 0), 0);

    const upcomingSessions = await Session.countDocuments({
      group: { $in: groupIds },
      status: "UPCOMING",
      date: { $gte: startOfToday() },
    });

    const evaluations = await MentorEvaluation.find({ mentor: mentor._id });
    let averageRating = 5.0;
    if (evaluations.length > 0) {
      const totalOverall = evaluations.reduce((sum, ev) => {
        const avg =
          (ev.ratings.communication + ev.ratings.guidance + ev.ratings.availability +
            ev.ratings.knowledgeSharing + ev.ratings.overallExperience) / 5;
        return sum + avg;
      }, 0);
      averageRating = +(totalOverall / evaluations.length).toFixed(2);
    }

    const blogCount = await Blog.countDocuments({ author: req.user.id });

    res.json({ studentCount, upcomingSessions, averageRating, blogCount });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

// Public — no auth required, powers the landing page stats strip
// Public — no auth required. Everything here is a real count from the database:
// only active accounts are counted, and nothing is shown for data that does not exist yet.
const getPublicStats = async (req, res) => {
  try {
    const [mentorUserIds, studentUserIds] = await Promise.all([
      User.find({ role: "MENTOR", isActive: true }).distinct("_id"),
      User.find({ role: "STUDENT", isActive: true }).distinct("_id"),
    ]);

    const [
      totalMentors,
      totalStudents,
      totalSessionsCompleted,
      upcomingSessions,
      activeSemester,
      evaluations,
    ] = await Promise.all([
      Mentor.countDocuments({ status: "ACTIVE", user: { $in: mentorUserIds } }),
      Student.countDocuments({ user: { $in: studentUserIds } }),
      Session.countDocuments({ status: "COMPLETED" }),
      Session.countDocuments({ status: "UPCOMING", date: { $gte: startOfToday() } }),
      Semester.findOne({ status: "ACTIVE" }).sort({ startDate: -1 }).select("name academicYear"),
      MentorEvaluation.find().select("ratings"),
    ]);

    const categories = ["communication", "guidance", "availability", "knowledgeSharing", "overallExperience"];
    const perEvaluation = evaluations
      .map((item) => {
        const values = categories.map((key) => Number(item.ratings?.[key])).filter((v) => v > 0);
        return values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : null;
      })
      .filter((value) => value !== null);

    res.json({
      totalMentors,
      totalStudents,
      totalSessionsCompleted,
      upcomingSessions,
      activeSemester: activeSemester
        ? { name: activeSemester.name, academicYear: activeSemester.academicYear }
        : null,
      totalEvaluations: perEvaluation.length,
      averageMentorRating: perEvaluation.length
        ? +(perEvaluation.reduce((sum, v) => sum + v, 0) / perEvaluation.length).toFixed(1)
        : null,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

// Public — no auth required, powers the mentors shown on the homepage.
// Only real ratings are shown: a mentor nobody has evaluated yet has overallRating = null
// (the page shows "New mentor"), never an invented 5/5. Rated mentors come first.
const getTopRatedMentors = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 6, 12);

    const mentors = await Mentor.find({ status: "ACTIVE" }).populate("user", "name isActive");
    const activeMentors = mentors.filter((m) => m.user && m.user.isActive);

    const results = await Promise.all(
      activeMentors.map(async (mentor) => {
        const rating = await calculateMentorRating(mentor._id);
        const hasFeedback = rating.totalEvaluations > 0;

        const mentorGroups = await MentorshipGroup.find({
          mentor: mentor._id,
        }).select("semester");

        const semesterIds = new Set(
          mentorGroups
            .map((group) => group.semester?.toString())
            .filter(Boolean)
        );

        return {
          mentorId: mentor._id,
          name: mentor.user.name,
          department: mentor.department,
          expertise: mentor.expertise,
          profileImage: mentor.profileImage || null,
          overallRating: hasFeedback ? rating.overallRating : null,
          totalFeedbacks: rating.totalEvaluations,
          totalSemesters: semesterIds.size,
        };
      })
    );

    results.sort((a, b) => {
      const aRated = a.overallRating !== null;
      const bRated = b.overallRating !== null;
      if (aRated !== bRated) return aRated ? -1 : 1;
      if (aRated && b.overallRating !== a.overallRating) return b.overallRating - a.overallRating;
      if (b.totalFeedbacks !== a.totalFeedbacks) return b.totalFeedbacks - a.totalFeedbacks;
      return String(a.name).localeCompare(String(b.name));
    });

    res.json({ mentors: results.slice(0, limit) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

module.exports = {
  getAdminDashboard,
  getStudentDashboard,
  getMentorDashboard,
  getPublicStats,
  getTopRatedMentors,
};
