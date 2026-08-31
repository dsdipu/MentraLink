const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    studentId: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    batch: { type: String, required: true },
    profileImage: { type: String },
    phone: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);