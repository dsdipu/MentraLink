const mongoose = require("mongoose");

const mentorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    mentorStudentId: { type: String }, 
    department: { type: String, required: true },
    expertise: { type: String },
    profileImage: { type: String },
    phone: { type: String },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Mentor", mentorSchema);