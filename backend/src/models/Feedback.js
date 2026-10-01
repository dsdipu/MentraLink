const mongoose = require("mongoose");

const feedbackAnswerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    question: { type: String, required: true },
    answer: { type: String, default: "" },
  },
  { _id: false }
);

const feedbackSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    answers: { type: [feedbackAnswerSchema], default: [] },
  },
  { timestamps: true }
);

feedbackSchema.index({ session: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
