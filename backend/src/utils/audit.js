const AuditLog = require("../models/AuditLog");

const clip = (value, max) => String(value ?? "").slice(0, max);

// Best-effort: writing the audit trail must never break the request that triggered it.
// `req` may be anything with { ip, headers, user }.
const audit = async (req, action, { target = "", details, actor, actorEmail, actorRole } = {}) => {
  try {
    await AuditLog.create({
      actor: actor || req?.user?.id || undefined,
      actorEmail: clip(actorEmail, 200),
      actorRole: clip(actorRole || req?.user?.role, 20),
      action: clip(action, 60),
      target: clip(target, 200),
      details,
      ip: clip(req?.ip, 64),
      userAgent: clip(req?.headers?.["user-agent"], 200),
    });
  } catch (err) {
    console.error("Audit log failed:", err.message);
  }
};

module.exports = audit;
