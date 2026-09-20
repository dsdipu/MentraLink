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
    session: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    coverImage: { type: String },
    images: [{ type: String }], // gallery images (URLs — uploaded or pasted)
    links: [
      {
        label: { type: String, default: "" },
        url: { type: String, required: true },
      },
    ],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);