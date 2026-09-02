const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ["EXPERIENCE", "TECH", "CAREER_TIPS", "SESSION_RECAP", "OTHER"],
      default: "OTHER",
    },
    session: { type: mongoose.Schema.Types.ObjectId, ref: "Session" }, // optional — kon session niye lekha
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    coverImage: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);