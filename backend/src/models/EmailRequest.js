const mongoose = require("mongoose");

const emailRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    personalEmail: { type: String, required: true },
    phone: { type: String },
    admissionInfo: { type: String },
    message: { type: String },
    status: { type: String, enum: ["PENDING", "CONTACTED", "RESOLVED"], default: "PENDING" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailRequest", emailRequestSchema);