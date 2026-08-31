const MentorshipGroup = require("../models/MentorshipGroup");

// Admin: create group
const createGroup = async (req, res) => {
  try {
    const { name, semester, mentor, students, status } = req.body;
    const group = await MentorshipGroup.create({ name, semester, mentor, students, status });
    res.status(201).json({ group });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all groups (with populated references)
const getGroups = async (req, res) => {
  try {
    const groups = await MentorshipGroup.find()
      .populate("semester", "name academicYear status")
      .populate({ path: "mentor", populate: { path: "user", select: "name email" } })
      .populate({ path: "students", populate: { path: "user", select: "name email" } });
    res.json({ groups });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get single group
const getGroupById = async (req, res) => {
  try {
    const group = await MentorshipGroup.findById(req.params.id)
      .populate("semester", "name academicYear status")
      .populate({ path: "mentor", populate: { path: "user", select: "name email" } })
      .populate({ path: "students", populate: { path: "user", select: "name email" } });
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json({ group });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Admin: update group (rename, change status, etc.)
const updateGroup = async (req, res) => {
  try {
    const group = await MentorshipGroup.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json({ group });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Admin: assign mentor to group
const assignMentor = async (req, res) => {
  try {
    const { mentorId } = req.body;
    const group = await MentorshipGroup.findByIdAndUpdate(
      req.params.id,
      { mentor: mentorId },
      { new: true }
    );
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json({ group });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Admin: assign student(s) to group
const assignStudents = async (req, res) => {
  try {
    const { studentIds } = req.body; // array of student IDs
    const group = await MentorshipGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    studentIds.forEach((id) => {
      if (!group.students.includes(id)) {
        group.students.push(id);
      }
    });

    await group.save();
    res.json({ group });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Admin: delete group
const deleteGroup = async (req, res) => {
  try {
    const group = await MentorshipGroup.findByIdAndDelete(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json({ message: "Group deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  assignMentor,
  assignStudents,
  deleteGroup,
};