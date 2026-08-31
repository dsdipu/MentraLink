const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    status: { type: String, enum: ["PRESENT", "ABSENT"], required: true },
  },
  { timestamps: true }
);

// prevent duplicate attendance entry for same student in same session
attendanceSchema.index({ session: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);