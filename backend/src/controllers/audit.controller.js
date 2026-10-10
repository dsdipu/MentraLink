const AuditLog = require("../models/AuditLog");

// Admin: browse the audit trail (newest first), optionally filtered
const getAuditLogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));

    const filter = {};
    if (typeof req.query.action === "string" && req.query.action) filter.action = req.query.action;
    if (typeof req.query.search === "string" && req.query.search.trim()) {
      const escaped = req.query.search.trim().slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(escaped, "i");
      filter.$or = [{ actorEmail: pattern }, { target: pattern }];
    }

    const [logs, total, actions] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("actor", "name email"),
      AuditLog.countDocuments(filter),
      AuditLog.distinct("action"),
    ]);

    res.json({ logs, total, page, pages: Math.max(1, Math.ceil(total / limit)), actions: actions.sort() });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
};

module.exports = { getAuditLogs };
