const MentorEvaluation = require("../models/MentorEvaluation");
const Student = require("../models/Student");
const Mentor = require("../models/Mentor");
const Session = require("../models/Session");
const { calculateMentorRating } = require("../services/rating.service");

// Anyone permitted: a specific mentor's aggregated rating
const getMentorRating = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const rating = await calculateMentorRating(mentorId, req.query.semesterId || null);
    res.json(rating);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Mentor: their own aggregated rating
const getMyRating = async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ user: req.user.id });
    if (!mentor) return res.status(404).json({ message: "Mentor profile not found" });

    const rating = await calculateMentorRating(mentor._id, req.query.semesterId || null);
    res.json(rating);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Student: submit an evaluation for a specific session
const submitEvaluation = async (req, res) => {
  try {
    const { sessionId, ratings, comment } = req.body;

    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const evaluation = await MentorEvaluation.create({
      session: sessionId,
      student: student._id,
      mentor: session.mentor,
      semester: session.semester,
      ratings,
      comment,
    });

    res.status(201).json({ evaluation });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You have already evaluated this session" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Student: their own evaluation history
const getMyEvaluations = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const evaluations = await MentorEvaluation.find({ student: student._id }).populate("session", "title date");
    res.json({ evaluations });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Student: check if a specific session is already evaluated
const getEvaluationStatus = async (req, res) => {
  try {
    const { sessionId } = req.query;
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const existing = await MentorEvaluation.findOne({ student: student._id, session: sessionId });
    res.json({ alreadyEvaluated: !!existing });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getMentorRating, getMyRating, submitEvaluation, getMyEvaluations, getEvaluationStatus };