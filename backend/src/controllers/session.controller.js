const Session = require("../models/Session");
const Student = require("../models/Student");
const Mentor = require("../models/Mentor");
const MentorshipGroup = require("../models/MentorshipGroup");

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
      .populate({
        path: "group",
        populate: { path: "students", populate: { path: "user", select: "name email" } },
      });
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

// Mentor/Admin: update session status
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
};

// Get next upcoming session
const getNextSession = async (req, res) => {
  try {
    const filter = {
      status: "UPCOMING",
      date: { $gte: new Date() },
    };

    if (req.query.group) filter.group = req.query.group;
    if (req.query.mentor) filter.mentor = req.query.mentor;
    if (req.query.semester) filter.semester = req.query.semester;

    const session = await Session.findOne(filter)
      .populate("semester", "name")
      .populate("group", "name")
      .populate({ path: "mentor", populate: { path: "user", select: "name email" } })
      .sort({ date: 1 });

    if (!session) {
      return res.status(404).json({ message: "No upcoming session found" });
    }

    res.status(200).json({ message: "Next session retrieved successfully", session });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Student: only sessions for the group(s) they belong to
const getMySessions = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const groups = await MentorshipGroup.find({ students: student._id }).select("_id");
    const groupIds = groups.map((g) => g._id);

    const sessions = await Session.find({ group: { $in: groupIds } })
      .populate("semester", "name")
      .populate("group", "name")
      .populate({ path: "mentor", populate: { path: "user", select: "name email" } })
      .sort({ date: 1 });

    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Mentor: only sessions they are running, optionally filtered by status
const getMyMentorSessions = async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ user: req.user.id });
    if (!mentor) return res.status(404).json({ message: "Mentor profile not found" });

    const filter = { mentor: mentor._id };
    if (req.query.status) filter.status = req.query.status;

    const sessions = await Session.find(filter)
      .populate("semester", "name")
      .populate("group", "name")
      .sort({ date: 1 });

    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  updateSessionStatus,
  deleteSession,
  getNextSession,
  getMySessions,
  getMyMentorSessions,
};