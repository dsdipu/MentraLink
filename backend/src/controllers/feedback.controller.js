const Feedback = require("../models/Feedback");
const Student = require("../models/Student");
const Session = require("../models/Session");
const MentorshipGroup = require("../models/MentorshipGroup");
const Mentor = require("../models/Mentor");
const mongoose = require("mongoose");
const { normalizeYesNo, summarizeRatings, summarizeQuestions } = require("../services/feedbackStats.service");

// Student: submit feedback for a completed session
const submitFeedback = async (req, res) => {
  try {
    const { sessionId, rating, comment, answers = [] } = req.body;

    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const session = await Session.findById(sessionId).populate("template", "questions");
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "COMPLETED") {
      return res.status(400).json({ message: "Feedback can only be submitted for completed sessions" });
    }

    const group = await MentorshipGroup.findById(session.group).select("students");
    if (!group || !group.students.some((id) => id.toString() === student._id.toString())) {
      return res.status(403).json({ message: "You can only give feedback for your own sessions" });
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const submittedAnswers = Array.isArray(answers) ? answers : [];
    const templateQuestions = session.template?.questions || [];
    const answersById = new Map(
      submittedAnswers.map((item) => [String(item.questionId), String(item.answer ?? "").trim()])
    );

    const invalidYesNo = templateQuestions.find((question) => {
      const raw = answersById.get(String(question._id));
      return question.type === "YESNO" && raw && !normalizeYesNo(raw);
    });
    if (invalidYesNo) {
      return res.status(400).json({
        message: `Please answer Yes or No for: ${invalidYesNo.question}`,
      });
    }

    const questionAnswers = templateQuestions.map((question) => {
      const raw = answersById.get(String(question._id)) || "";
      return {
        questionId: question._id,
        question: question.question,
        type: question.type === "YESNO" ? "YESNO" : "TEXT",
        answer: question.type === "YESNO" ? normalizeYesNo(raw) || "" : raw,
      };
    });

    const missingRequired = templateQuestions.find(
      (question) => question.required && !answersById.get(String(question._id))
    );

    if (missingRequired) {
      return res.status(400).json({
        message: `Please answer the required question: ${missingRequired.question}`,
      });
    }

    const feedback = await Feedback.create({
      session: sessionId,
      student: student._id,
      rating: numericRating,
      comment,
      answers: questionAnswers,
    });

    res.status(201).json({ feedback });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You have already submitted feedback for this session" });
    }
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

// Student: their own feedback history
const getMyFeedbackHistory = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const feedbacks = await Feedback.find({ student: student._id })
      .populate("session", "title date sessionNumber")
      .sort({ createdAt: -1 });
    res.json({ feedbacks });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

// A mentor may only read feedback of their own sessions (admins can read everything).
// Returns true when access is allowed, otherwise sends the error response and returns false.
const ensureCanReadSession = async (req, res, session) => {
  if (req.user.role === "ADMIN") return true;
  const mentor = await Mentor.findOne({ user: req.user.id }).select("_id");
  if (!mentor || String(session.mentor) !== String(mentor._id)) {
    res.status(403).json({ message: "You can only view feedback of your own sessions" });
    return false;
  }
  return true;
};

// Mentor: a session's full feedback + average rating
const getSessionFeedback = async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({ message: "Invalid session id" });
    }
    const ownedSession = await Session.findById(sessionId).select("mentor");
    if (!ownedSession) return res.status(404).json({ message: "Session not found" });
    if (!(await ensureCanReadSession(req, res, ownedSession))) return;

    const feedbacks = await Feedback.find({ session: sessionId })
      .populate({ path: "student", populate: { path: "user", select: "name" } });

    const averageRating =
      feedbacks.length > 0
        ? +(feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(2)
        : 0;

    res.json({ feedbacks, averageRating, totalFeedback: feedbacks.length });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

// Mentor: overall feedback across all of their completed sessions + one line per session
const getMyFeedbackOverview = async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ user: req.user.id }).select("_id");
    if (!mentor) return res.status(404).json({ message: "Mentor profile not found" });

    const sessions = await Session.find({ mentor: mentor._id, status: "COMPLETED" })
      .select("title sessionNumber date group")
      .sort({ sessionNumber: 1, date: 1 });

    const sessionIds = sessions.map((s) => s._id);
    const feedbacks = await Feedback.find({ session: { $in: sessionIds } }).select("session rating");

    const groups = await MentorshipGroup.find({
      _id: { $in: sessions.map((s) => s.group) },
    }).select("students");
    const studentCountByGroup = new Map(groups.map((g) => [String(g._id), g.students.length]));

    const overall = summarizeRatings(feedbacks);

    const sessionRows = sessions.map((session) => {
      const own = feedbacks.filter((f) => String(f.session) === String(session._id));
      const summary = summarizeRatings(own);
      return {
        _id: session._id,
        sessionNumber: session.sessionNumber,
        title: session.title,
        date: session.date,
        totalStudents: studentCountByGroup.get(String(session.group)) || 0,
        totalResponses: summary.totalResponses,
        averageRating: summary.averageRating,
      };
    });

    res.json({ overall: { ...overall, totalSessions: sessions.length }, sessions: sessionRows });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

// Mentor/Admin: one session's rating summary + per-question statistics
// (Yes/No questions => yes/no percentages for the pie chart, text questions => anonymous answers)
const getSessionFeedbackSummary = async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({ message: "Invalid session id" });
    }

    const session = await Session.findById(sessionId).populate("template", "questions");
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (!(await ensureCanReadSession(req, res, session))) return;

    const feedbacks = await Feedback.find({ session: sessionId }).select("rating answers");

    res.json({
      session: {
        _id: session._id,
        sessionNumber: session.sessionNumber,
        title: session.title,
        date: session.date,
      },
      ...summarizeRatings(feedbacks),
      questions: summarizeQuestions(session.template?.questions || [], feedbacks),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

module.exports = {
  submitFeedback,
  getMyFeedbackHistory,
  getSessionFeedback,
  getMyFeedbackOverview,
  getSessionFeedbackSummary,
};
