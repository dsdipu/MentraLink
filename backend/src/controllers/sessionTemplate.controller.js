const SessionTemplate = require("../models/SessionTemplate");
const Semester = require("../models/Semester");
const Session = require("../models/Session");

const validateTemplatePayload = async (semesterId, sessionNumber, title, questions) => {
  if (!semesterId || !sessionNumber || !title?.trim()) {
    return "Semester, session number and title are required";
  }

  const number = Number(sessionNumber);
  if (!Number.isInteger(number) || number < 1 || number > 12) {
    return "Session number must be between 1 and 12";
  }

  const semester = await Semester.findById(semesterId);
  if (!semester) {
    return "Semester not found";
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return "At least one feedback question is required";
  }

  const hasInvalidQuestion = questions.some(
    (item) => !item?.question?.trim()
  );

  if (hasInvalidQuestion) {
    return "Every feedback question must have text";
  }

  return null;
};

const getSessionTemplates = async (req, res) => {
  try {
    const filter = {};
    if (req.query.semester) {
      filter.semester = req.query.semester;
    }

    const templates = await SessionTemplate.find(filter)
      .populate("semester", "name academicYear batch startDate endDate status")
      .sort({ semester: -1, sessionNumber: 1 });

    res.json({ templates });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


const getMyMentorSessionTemplates = async (req, res) => {
  try {
    const Mentor = require("../models/Mentor");
    const MentorshipGroup = require("../models/MentorshipGroup");

    const mentor = await Mentor.findOne({ user: req.user.id });
    if (!mentor) {
      return res.status(404).json({ message: "Mentor profile not found" });
    }

    const groups = await MentorshipGroup.find({
      mentor: mentor._id,
      status: "ACTIVE",
    }).select("semester");

    const semesterIds = [
      ...new Set(groups.map((group) => group.semester?.toString()).filter(Boolean)),
    ];

    if (semesterIds.length === 0) {
      return res.json({ templates: [] });
    }

    const templates = await SessionTemplate.find({
      semester: { $in: semesterIds },
    })
      .populate("semester", "name academicYear batch startDate endDate status")
      .sort({ semester: -1, sessionNumber: 1 });

    res.json({ templates });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getSessionTemplateById = async (req, res) => {
  try {
    const template = await SessionTemplate.findById(req.params.id).populate(
      "semester",
      "name academicYear batch startDate endDate status"
    );

    if (!template) {
      return res.status(404).json({ message: "Session template not found" });
    }

    res.json({ template });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const createSessionTemplate = async (req, res) => {
  try {
    const {
      semester,
      sessionNumber,
      title,
      description,
      questions,
    } = req.body;

    const validationError = await validateTemplatePayload(
      semester,
      sessionNumber,
      title,
      questions
    );

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const existing = await SessionTemplate.findOne({
      semester,
      sessionNumber: Number(sessionNumber),
    });

    if (existing) {
      return res.status(400).json({
        message: `Session ${sessionNumber} already exists for this semester`,
      });
    }

    const templateCount = await SessionTemplate.countDocuments({ semester });
    if (templateCount >= 12) {
      return res.status(400).json({
        message: "A semester can have a maximum of 12 session templates",
      });
    }

    const template = await SessionTemplate.create({
      semester,
      sessionNumber: Number(sessionNumber),
      title: title.trim(),
      description: description?.trim() || "",
      questions: questions.map((item) => ({
        question: item.question.trim(),
        required: item.required !== false,
      })),
    });

    const populatedTemplate = await SessionTemplate.findById(template._id).populate(
      "semester",
      "name academicYear batch startDate endDate status"
    );

    res.status(201).json({ template: populatedTemplate });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "This session number already exists for the selected semester",
      });
    }

    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateSessionTemplate = async (req, res) => {
  try {
    const template = await SessionTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: "Session template not found" });
    }

    const semester = req.body.semester || template.semester;
    const sessionNumber =
      req.body.sessionNumber ?? template.sessionNumber;
    const title = req.body.title ?? template.title;
    const questions = req.body.questions ?? template.questions;

    const validationError = await validateTemplatePayload(
      semester,
      sessionNumber,
      title,
      questions
    );

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const duplicate = await SessionTemplate.findOne({
      _id: { $ne: template._id },
      semester,
      sessionNumber: Number(sessionNumber),
    });

    if (duplicate) {
      return res.status(400).json({
        message: `Session ${sessionNumber} already exists for this semester`,
      });
    }

    template.semester = semester;
    template.sessionNumber = Number(sessionNumber);
    template.title = title.trim();
    template.description = req.body.description?.trim() || "";
    template.questions = questions.map((item) => ({
      _id: item._id,
      question: item.question.trim(),
      required: item.required !== false,
    }));

    await template.save();

    const updatedTemplate = await SessionTemplate.findById(template._id).populate(
      "semester",
      "name academicYear batch startDate endDate status"
    );

    res.json({ template: updatedTemplate });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "This session number already exists for the selected semester",
      });
    }

    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const deleteSessionTemplate = async (req, res) => {
  try {
    const template = await SessionTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: "Session template not found" });
    }

    const scheduledSession = await Session.findOne({
      template: template._id,
    });

    if (scheduledSession) {
      return res.status(400).json({
        message: "This session has already been scheduled and cannot be deleted",
      });
    }

    await SessionTemplate.findByIdAndDelete(template._id);

    res.json({ message: "Session template deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getSessionTemplates,
  getMyMentorSessionTemplates,
  getSessionTemplateById,
  createSessionTemplate,
  updateSessionTemplate,
  deleteSessionTemplate,
};
