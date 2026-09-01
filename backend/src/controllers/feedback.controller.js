const Feedback = require("../models/Feedback");
const Student = require("../models/Student");

// Student: session feedback submit
const submitFeedback = async (req, res) => {
  try {
    const { sessionId, rating, comment } = req.body;

    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const feedback = await Feedback.create({
      session: sessionId,
      student: student._id,
      rating,
      comment,
    });

    res.status(201).json({ feedback });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You have already submitted feedback for this session" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Student: nijer shob feedback history
const getMyFeedbackHistory = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const feedbacks = await Feedback.find({ student: student._id }).populate("session", "title date");
    res.json({ feedbacks });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Mentor: ekta session er shob feedback + average rating
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