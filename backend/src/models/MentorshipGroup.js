const mongoose = require("mongoose");

const mentorshipGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "SWE-M01"
    semester: { type: mongoose.Schema.Types.ObjectId, ref: "Semester", required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor", required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MentorshipGroup", mentorshipGroupSchema);