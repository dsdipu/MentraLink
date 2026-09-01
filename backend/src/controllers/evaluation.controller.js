const { calculateMentorRating } = require("../services/rating.service");

// Public (any authenticated role): get aggregated rating for a mentor
const getMentorRating = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { semesterId } = req.query; // optional filter

    const rating = await calculateMentorRating(mentorId, semesterId || null);
    res.json({ mentorId, ...rating });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getMentorRating };
const MentorEvaluation = require("../models/MentorEvaluation");
const Student = require("../models/Student");

// Student: semester evaluation submit
const submitEvaluation = async (req, res) => {
  try {
    const { mentorId, semesterId, ratings, comment } = req.body;

    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const evaluation = await MentorEvaluation.create({
      student: student._id,
      mentor: mentorId,
      semester: semesterId,
      ratings,
      comment,
    });

    res.status(201).json({ evaluation });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You have already evaluated this mentor for this semester" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Student: nijer shob evaluation history
const getMyEvaluations = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const evaluations = await MentorEvaluation.find({ student: student._id });
    res.json({ evaluations });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Student: ei semester e already evaluate kora hoyeche kina check
const getEvaluationStatus = async (req, res) => {
  try {
    const { mentorId, semesterId } = req.query;
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const existing = await MentorEvaluation.findOne({
      student: student._id,
      mentor: mentorId,
      semester: semesterId,
    });

    res.json({ alreadyEvaluated: !!existing });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getMentorRating, submitEvaluation, getMyEvaluations, getEvaluationStatus };