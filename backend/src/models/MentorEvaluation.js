const mongoose = require("mongoose");

const mentorEvaluationSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor", required: true },
    semester: { type: mongoose.Schema.Types.ObjectId, ref: "Semester", required: true },
    ratings: {
      communication: { type: Number, min: 1, max: 5, required: true },
      guidance: { type: Number, min: 1, max: 5, required: true },
      availability: { type: Number, min: 1, max: 5, required: true },
      knowledgeSharing: { type: Number, min: 1, max: 5, required: true },
      overallExperience: { type: Number, min: 1, max: 5, required: true },
    },
    comment: { type: String },
  },
  { timestamps: true }
);

// one evaluation per student per session
mentorEvaluationSchema.index({ student: 1, session: 1 }, { unique: true });

module.exports = mongoose.model("MentorEvaluation", mentorEvaluationSchema);