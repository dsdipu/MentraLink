const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "MENTOR", "STUDENT"], required: true },
    isActive: { type: Boolean, default: true },
    passwordChangedAt: { type: Date }, // tokens issued before this moment are rejected

    submittedStudentId: { type: String }, // derived from email, e.g. "242034037"
    batch: { type: String }, // first 3 digits, e.g. "242"
    idCardImage: { type: String }, // legacy field, no longer written
    idCardPublicId: { type: String }, // private Cloudinary asset, deleted once the request is approved/rejected
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);