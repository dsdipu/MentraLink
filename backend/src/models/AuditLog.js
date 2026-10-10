const mongoose = require("mongoose");

// Security / administration trail. Never store passwords, tokens or OTP codes here.
const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    actorEmail: { type: String, default: "" },
    actorRole: { type: String, default: "" },
    action: { type: String, required: true, index: true },
    target: { type: String, default: "" },
    details: { type: mongoose.Schema.Types.Mixed },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 }); // keep one year

module.exports = mongoose.model("AuditLog", auditLogSchema);
