const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "MENTOR", "STUDENT"], required: true },
    isActive: { type: Boolean, default: true },

    // Student verification (only populated for role === "STUDENT")
    submittedStudentId: { type: String }, // their real university-issued ID, entered at registration
    idCardImage: { type: String }, // Cloudinary URL of their uploaded ID card photo
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);