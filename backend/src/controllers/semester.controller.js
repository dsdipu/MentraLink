const Semester = require("../models/Semester");

// Admin: create semester
const createSemester = async (req, res) => {
  try {
    const { name, academicYear, startDate, endDate, status } = req.body;
    const semester = await Semester.create({ name, academicYear, startDate, endDate, status });
    res.status(201).json({ semester });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all semesters
const getSemesters = async (req, res) => {
  try {
    const semesters = await Semester.find().sort({ startDate: -1 });
    res.json({ semesters });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get single semester
const getSemesterById = async (req, res) => {
  try {
    const semester = await Semester.findById(req.params.id);
    if (!semester) return res.status(404).json({ message: "Semester not found" });
    res.json({ semester });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Admin: update semester
const updateSemester = async (req, res) => {
  try {
    const semester = await Semester.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!semester) return res.status(404).json({ message: "Semester not found" });
    res.json({ semester });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Admin: delete semester
const deleteSemester = async (req, res) => {
  try {
    const semester = await Semester.findByIdAndDelete(req.params.id);
    if (!semester) return res.status(404).json({ message: "Semester not found" });
    res.json({ message: "Semester deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { createSemester, getSemesters, getSemesterById, updateSemester, deleteSemester };