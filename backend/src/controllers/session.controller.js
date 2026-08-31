const Session = require("../models/Session");

// Mentor/Admin: create session
const createSession = async (req, res) => {
  try {
    const { group, semester, mentor, sessionNumber, title, description, date, time, location, meetingLink } = req.body;
    const session = await Session.create({
      group, semester, mentor, sessionNumber, title, description, date, time, location, meetingLink,
    });
    res.status(201).json({ session });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all sessions (optionally filter by group/status)
const getSessions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.group) filter.group = req.query.group;
    if (req.query.status) filter.status = req.query.status;

    const sessions = await Session.find(filter)
      .populate("semester", "name")
      .populate({ path: "mentor", populate: { path: "user", select: "name email" } })
      .sort({ date: 1 });

    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get single session
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate("semester", "name")
      .populate({ path: "mentor", populate: { path: "user", select: "name email" } })
      .populate("group", "name");
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json({ session });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Mentor/Admin: update session (general info)
const updateSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json({ session });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Admin: delete session
const deleteSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json({ message: "Session deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//update session
const updateSessionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const session = await Session.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json({ session });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}


module.exports = {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  updateSessionStatus, 
  deleteSession,
};