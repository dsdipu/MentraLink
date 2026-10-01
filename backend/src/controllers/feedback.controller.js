const Feedback = require("../models/Feedback");
const Student = require("../models/Student");
const Session = require("../models/Session");
const MentorshipGroup = require("../models/MentorshipGroup");

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

    const questionAnswers = templateQuestions.map((question) => ({
      questionId: question._id,
      question: question.question,
      answer: answersById.get(String(question._id)) || "",
    }));

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
    res.status(500).json({ message: "Server error", error: err.message });
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
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Mentor: a session's full feedback + average rating
const getSessionFeedback = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const feedbacks = await Feedback.find({ session: sessionId })
      .populate({ path: "student", populate: { path: "user", select: "name" } });

    const averageRating =
      feedbacks.length > 0
        ? +(feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(2)
        : 0;

    res.json({ feedbacks, averageRating, totalFeedback: feedbacks.length });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { submitFeedback, getMyFeedbackHistory, getSessionFeedback };
