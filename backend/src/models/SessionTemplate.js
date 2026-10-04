const mongoose = require("mongoose");

const sessionQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    required: { type: Boolean, default: true },
    // TEXT = free-text answer, YESNO = Yes/No answer (shown as a pie chart to the mentor)
    type: { type: String, enum: ["TEXT", "YESNO"], default: "TEXT" },
  },
  { _id: true }
);

const sessionTemplateSchema = new mongoose.Schema(
  {
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
    },
    sessionNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    questions: {
      type: [sessionQuestionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

sessionTemplateSchema.index(
  { semester: 1, sessionNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model("SessionTemplate", sessionTemplateSchema);
