const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Spring 2026"
    academicYear: { type: String, required: true }, // e.g. "2025-2026"
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["UPCOMING", "ACTIVE", "COMPLETED"],
      default: "UPCOMING",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Semester", semesterSchema);