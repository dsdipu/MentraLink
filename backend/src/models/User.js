const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "MENTOR", "STUDENT"], required: true },
    isActive: { type: Boolean, default: true },

    submittedStudentId: { type: String }, // derived from email, e.g. "242034037"
    batch: { type: String }, // first 3 digits, e.g. "242"
    idCardImage: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);