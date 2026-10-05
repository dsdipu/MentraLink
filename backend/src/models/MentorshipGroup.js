const mongoose = require("mongoose");

const mentorshipGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "SWE-M01"
    semester: { type: mongoose.Schema.Types.ObjectId, ref: "Semester", required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor", default: null }, // optional — assigned later
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    // Student ID ranges that belong to this section, e.g. 262034001-262034017.
    // Every student whose ID falls in a range is assigned here automatically.
    studentIdRanges: {
      type: [
        {
          start: { type: String, required: true },
          end: { type: String, required: true },
          _id: false,
        },
      ],
      default: [],
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MentorshipGroup", mentorshipGroupSchema);