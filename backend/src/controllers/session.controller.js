const Session = require("../models/Session");
const Student = require("../models/Student");
const Mentor = require("../models/Mentor");
const MentorshipGroup = require("../models/MentorshipGroup");
const SessionTemplate = require("../models/SessionTemplate");

// Mentor/Admin: create session from an admin-created session template
const createSession = async (req, res) => {
  try {
    const { group, template, date, time, location, meetingLink } = req.body;

    if (!group || !template || !date || !time) {
      return res.status(400).json({
        message: "Section, session plan, date and time are required",
      });
    }

    const selectedGroup = await MentorshipGroup.findById(group);
    if (!selectedGroup) {
      return res.status(404).json({ message: "Section not found" });
    }

    const selectedTemplate = await SessionTemplate.findById(template);
    if (!selectedTemplate) {
      return res.status(404).json({ message: "Session plan not found" });
    }

    if (selectedGroup.semester.toString() !== selectedTemplate.semester.toString()) {
      return res.status(400).json({
        message: "This session plan does not belong to the selected section's semester",
      });
    }

    if (req.user.role === "MENTOR") {
      const mentor = await Mentor.findOne({ user: req.user.id });
      if (!mentor || !selectedGroup.mentor || selectedGroup.mentor.toString() !== mentor._id.toString()) {
        return res.status(403).json({ message: "You can only schedule sessions for your own sections" });
      }
    }

    const existing = await Session.findOne({ group, template });
    if (existing) {
      return res.status(400).json({
        message: `Session ${selectedTemplate.sessionNumber} is already scheduled for this section`,
      });
    }

    const mentorId = selectedGroup.mentor;
    if (!mentorId) {
      return res.status(400).json({ message: "A mentor must be assigned to the section first" });
    }

    const session = await Session.create({
      group,
      semester: selectedGroup.semester,
      mentor: mentorId,
      template,
      sessionNumber: selectedTemplate.sessionNumber,
      title: selectedTemplate.title,
      description: selectedTemplate.description,
      date,
      time,
      location,
      meetingLink,
    });

    const populatedSession = await Session.findById(session._id)
      .populate("semester", "name")
      .populate("group", "name")
      .populate("template", "sessionNumber title description questions")
      .populate({ path: "mentor", populate: { path: "user", select: "name email" } });

    res.status(201).json({ session: populatedSession });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "This session is already scheduled for this section" });
    }
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

// Mentor/Admin: update session schedule
const updateSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (req.user.role === "MENTOR") {
      const mentor = await Mentor.findOne({ user: req.user.id });
      if (!mentor || session.mentor.toString() !== mentor._id.toString()) {
        return res.status(403).json({ message: "You can only update your own sessions" });
      }

      const allowedFields = ["date", "time", "location", "meetingLink"];
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) session[field] = req.body[field];
      });
    } else {
      Object.assign(session, req.body);
    }

    await session.save();

    const populatedSession = await Session.findById(session._id)
      .populate("semester", "name")
      .populate("group", "name")
      .populate("template", "sessionNumber title description questions")
      .populate({ path: "mentor", populate: { path: "user", select: "name email" } });

    res.json({ session: populatedSession });
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
      date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }, // was: new Date()
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
      .populate("template", "sessionNumber title description questions")
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