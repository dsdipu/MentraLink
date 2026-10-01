const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: "MentorshipGroup", required: true },
    semester: { type: mongoose.Schema.Types.ObjectId, ref: "Semester", required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor", required: true },
    template: { type: mongoose.Schema.Types.ObjectId, ref: "SessionTemplate", required: true },
    sessionNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String },
    meetingLink: { type: String },
    status: {
      type: String,
      enum: ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"],
      default: "UPCOMING",
    },
  },
  { timestamps: true }
);

sessionSchema.index(
  { group: 1, template: 1 },
  { unique: true, partialFilterExpression: { template: { $exists: true } } }
);

module.exports = mongoose.model("Session", sessionSchema);