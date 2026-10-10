const MentorshipGroup = require("../models/MentorshipGroup");
const audit = require("../utils/audit");
const {
  normalizeRanges,
  findOverlapWithOtherGroups,
  applyGroupRanges,
} = require("../services/groupRanges.service");

const getSemesterModel = () => require("../models/Semester");
const getMentorModel = () => require("../models/Mentor");
const getStudentModel = () => require("../models/Student");

const validateStudentsForSemester = async (semesterId, studentIds) => {
  const Semester = getSemesterModel();
  const Student = getStudentModel();

  const semester = await Semester.findById(semesterId).select(
    "name batch"
  );

  if (!semester) {
    return {
      valid: false,
      message: "Semester not found",
    };
  }

  if (!semester.batch) {
    return {
      valid: false,
      message: `Batch is not configured for ${semester.name}. Please set the semester batch first.`,
    };
  }

  if (!Array.isArray(studentIds)) {
    return {
      valid: false,
      message: "Students must be an array",
    };
  }

  if (studentIds.length === 0) {
    return {
      valid: true,
      semester,
    };
  }

  const uniqueStudentIds = [
    ...new Set(studentIds.map((studentId) => studentId.toString())),
  ];

  const students = await Student.find({
    _id: { $in: uniqueStudentIds },
  }).select("_id studentId batch");

  if (students.length !== uniqueStudentIds.length) {
    return {
      valid: false,
      message: "One or more selected students do not exist",
    };
  }

  const invalidStudents = students.filter(
    (student) => student.batch !== semester.batch
  );

  if (invalidStudents.length > 0) {
    return {
      valid: false,
      message: `Only batch ${semester.batch} students can be assigned to ${semester.name}.`,
    };
  }

  return {
    valid: true,
    semester,
  };
};

const createGroup = async (req, res) => {
  try {
    const {
      name,
      semester,
      mentor,
      students = [],
      status = "ACTIVE",
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Section name is required",
      });
    }

    if (!semester) {
      return res.status(400).json({
        message: "Semester is required",
      });
    }

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({
        message: "Invalid section status",
      });
    }

    if (!Array.isArray(students)) {
      return res.status(400).json({
        message: "Students must be an array",
      });
    }

    const studentValidation = await validateStudentsForSemester(
      semester,
      students
    );

    if (!studentValidation.valid) {
      return res.status(400).json({
        message: studentValidation.message,
      });
    }

    if (mentor) {
      const Mentor = getMentorModel();

      const mentorExists = await Mentor.findById(mentor);

      if (!mentorExists) {
        return res.status(400).json({
          message: "Invalid mentor",
        });
      }
    }

    if (status === "ACTIVE" && students.length > 0) {
      const existingAssignment = await MentorshipGroup.findOne({
        students: { $in: students },
        status: "ACTIVE",
      });

      if (existingAssignment) {
        return res.status(400).json({
          message: `One or more selected students are already assigned to another active section (${existingAssignment.name})`,
        });
      }
    }

    const group = await MentorshipGroup.create({
      name: name.trim(),
      semester,
      mentor: mentor || null,
      students,
      status,
    });

    const populatedGroup = await MentorshipGroup.findById(group._id)
      .populate(
        "semester",
        "name academicYear status batch"
      )
      .populate({
        path: "mentor",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "students",
        populate: {
          path: "user",
          select: "name email",
        },
      });

    res.status(201).json({
      group: populatedGroup,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
};

const getGroups = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === "MENTOR") {
      const Mentor = getMentorModel();

      const mentor = await Mentor.findOne({
        user: req.user.id,
      });

      if (!mentor) {
        return res.json({
          groups: [],
        });
      }

      filter.mentor = mentor._id;
      filter.status = "ACTIVE";
    }

    if (req.user.role === "STUDENT") {
      const Student = getStudentModel();

      const student = await Student.findOne({
        user: req.user.id,
      });

      if (!student) {
        return res.json({
          groups: [],
        });
      }

      filter.students = student._id;
      filter.status = "ACTIVE";
    }

    const groups = await MentorshipGroup.find(filter)
      .sort({
        status: 1,
        createdAt: -1,
      })
      .populate(
        "semester",
        "name academicYear status batch"
      )
      .populate({
        path: "mentor",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "students",
        populate: {
          path: "user",
          select: "name email",
        },
      });

    res.json({
      groups,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
};

// A mentor may open only their own groups; a student only the group they belong to.
const canAccessGroup = async (req, group) => {
  if (req.user.role === "ADMIN") return true;

  if (req.user.role === "MENTOR") {
    const mentor = await getMentorModel().findOne({ user: req.user.id }).select("_id");
    return !!mentor && !!group.mentor && String(group.mentor._id || group.mentor) === String(mentor._id);
  }

  if (req.user.role === "STUDENT") {
    const student = await getStudentModel().findOne({ user: req.user.id }).select("_id");
    return !!student && group.students.some((s) => String(s._id || s) === String(student._id));
  }

  return false;
};

const getGroupById = async (req, res) => {
  try {
    const group = await MentorshipGroup.findById(req.params.id)
      .populate(
        "semester",
        "name academicYear status batch"
      )
      .populate({
        path: "mentor",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "students",
        populate: {
          path: "user",
          select: "name email",
        },
      });

    if (!group) {
      return res.status(404).json({
        message: "Section not found",
      });
    }

    if (!(await canAccessGroup(req, group))) {
      return res.status(403).json({
        message: "You can only view your own section",
      });
    }

    res.json({
      group,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
};

const updateGroup = async (req, res) => {
  try {
    const group = await MentorshipGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        message: "Section not found",
      });
    }

    const {
      name,
      semester,
      mentor,
      students,
      status,
    } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Section name cannot be empty",
        });
      }

      group.name = name.trim();
    }

    const targetSemester =
      semester !== undefined ? semester : group.semester;

    const targetStudents =
      students !== undefined ? students : group.students;

    if (semester !== undefined) {
      group.semester = semester;
    }

    if (status !== undefined) {
      if (!["ACTIVE", "INACTIVE"].includes(status)) {
        return res.status(400).json({
          message: "Invalid section status",
        });
      }

      group.status = status;
    }

    if (mentor !== undefined) {
      if (mentor === null || mentor === "") {
        group.mentor = null;
      } else {
        const Mentor = getMentorModel();

        const mentorExists = await Mentor.findById(mentor);

        if (!mentorExists) {
          return res.status(400).json({
            message: "Mentor not found",
          });
        }

        group.mentor = mentor;
      }
    }

    if (students !== undefined) {
      if (!Array.isArray(students)) {
        return res.status(400).json({
          message: "Students must be an array",
        });
      }

      group.students = students;
    }

    const studentValidation = await validateStudentsForSemester(
      targetSemester,
      targetStudents
    );

    if (!studentValidation.valid) {
      return res.status(400).json({
        message: studentValidation.message,
      });
    }

    if (group.status === "ACTIVE" && group.students.length > 0) {
      const existingAssignment = await MentorshipGroup.findOne({
        students: { $in: group.students },
        status: "ACTIVE",
        _id: { $ne: group._id },
      });

      if (existingAssignment) {
        return res.status(400).json({
          message: `One or more students are already assigned to another active section (${existingAssignment.name})`,
        });
      }
    }

    await group.save();

    const updatedGroup = await MentorshipGroup.findById(group._id)
      .populate(
        "semester",
        "name academicYear status batch"
      )
      .populate({
        path: "mentor",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "students",
        populate: {
          path: "user",
          select: "name email",
        },
      });

    res.json({
      group: updatedGroup,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
};

const assignMentor = async (req, res) => {
  try {
    const { mentorId } = req.body;

    if (!mentorId) {
      return res.status(400).json({
        message: "Mentor is required",
      });
    }

    const group = await MentorshipGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        message: "Section not found",
      });
    }

    if (group.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Mentor can only be assigned to an active section",
      });
    }

    const Mentor = getMentorModel();

    const mentor = await Mentor.findById(mentorId);

    if (!mentor) {
      return res.status(404).json({
        message: "Mentor not found",
      });
    }

    group.mentor = mentor._id;

    await group.save();

    const updatedGroup = await MentorshipGroup.findById(group._id)
      .populate(
        "semester",
        "name academicYear status batch"
      )
      .populate({
        path: "mentor",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "students",
        populate: {
          path: "user",
          select: "name email",
        },
      });

    res.json({
      group: updatedGroup,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
};

const assignStudents = async (req, res) => {
  try {
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        message: "At least one student is required",
      });
    }

    const group = await MentorshipGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        message: "Section not found",
      });
    }

    if (group.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Students can only be assigned to an active section",
      });
    }

    const uniqueStudentIds = [
      ...new Set(studentIds.map((studentId) => studentId.toString())),
    ];

    const validation = await validateStudentsForSemester(
      group.semester,
      uniqueStudentIds
    );

    if (!validation.valid) {
      return res.status(400).json({
        message: validation.message,
      });
    }

    const currentStudentIds = new Set(
      group.students.map((studentId) =>
        studentId.toString()
      )
    );

    const studentsToAdd = uniqueStudentIds.filter(
      (studentId) =>
        !currentStudentIds.has(studentId.toString())
    );

    if (studentsToAdd.length === 0) {
      return res.status(400).json({
        message: "Selected student is already assigned to this section",
      });
    }

    const existingAssignment = await MentorshipGroup.findOne({
      students: { $in: studentsToAdd },
      status: "ACTIVE",
      _id: { $ne: group._id },
    });

    if (existingAssignment) {
      return res.status(400).json({
        message: `One or more students are already assigned to another active section (${existingAssignment.name})`,
      });
    }

    group.students.push(...studentsToAdd);

    await group.save();

    const updatedGroup = await MentorshipGroup.findById(group._id)
      .populate(
        "semester",
        "name academicYear status batch"
      )
      .populate({
        path: "mentor",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "students",
        populate: {
          path: "user",
          select: "name email",
        },
      });

    res.json({
      group: updatedGroup,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
};

const unassignStudent = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        message: "Student is required",
      });
    }

    const group = await MentorshipGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        message: "Section not found",
      });
    }

    const studentIndex = group.students.findIndex(
      (id) => id.toString() === studentId.toString()
    );

    if (studentIndex === -1) {
      return res.status(400).json({
        message: "Student is not assigned to this section",
      });
    }

    group.students.splice(studentIndex, 1);

    await group.save();

    const updatedGroup = await MentorshipGroup.findById(group._id)
      .populate(
        "semester",
        "name academicYear status batch"
      )
      .populate({
        path: "mentor",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "students",
        populate: {
          path: "user",
          select: "name email",
        },
      });

    res.json({
      group: updatedGroup,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
};

const getMyGroup = async (req, res) => {
  try {
    const Student = getStudentModel();

    const student = await Student.findOne({
      user: req.user.id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const group = await MentorshipGroup.findOne({
      students: student._id,
      status: "ACTIVE",
    })
      .populate(
        "semester",
        "name academicYear status batch"
      )
      .populate({
        path: "mentor",
        populate: {
          path: "user",
          select: "name email",
        },
      });

    if (!group) {
      return res.status(404).json({
        message: "No active section assigned",
      });
    }

    res.json({
      group,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const group = await MentorshipGroup.findByIdAndDelete(
      req.params.id
    );

    if (!group) {
      return res.status(404).json({
        message: "Section not found",
      });
    }

    res.json({
      message: "Section deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
};

const populateGroup = (id) =>
  MentorshipGroup.findById(id)
    .populate("semester", "name academicYear status batch")
    .populate({ path: "mentor", populate: { path: "user", select: "name email" } })
    .populate({ path: "students", populate: { path: "user", select: "name email" } });

// Admin: save the student-ID ranges of a section and assign everyone inside them right away.
// Body: { ranges: [{ start, end }], moveExisting?: boolean }
const setGroupRanges = async (req, res) => {
  try {
    const group = await MentorshipGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Section not found" });

    if (group.status !== "ACTIVE") {
      return res.status(400).json({ message: "Ranges can only be set on an active section" });
    }

    const normalized = normalizeRanges(req.body.ranges);
    if (normalized.error) return res.status(400).json({ message: normalized.error });

    const overlap = await findOverlapWithOtherGroups(group, normalized.ranges);
    if (overlap) return res.status(400).json({ message: overlap });

    group.studentIdRanges = normalized.ranges;
    await group.save();

    const result = await applyGroupRanges(group, { moveExisting: !!req.body.moveExisting });
    await audit(req, "RANGES_SET", {
      target: group.name,
      details: {
        ranges: normalized.ranges,
        assigned: result.assigned.length,
        moved: result.moved.length,
        conflicts: result.conflicts.length,
      },
    });
    res.json({ group: await populateGroup(group._id), result });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
};

// Admin: one click, assign everyone inside the already-saved ranges (e.g. after new students joined)
const applyRanges = async (req, res) => {
  try {
    const group = await MentorshipGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Section not found" });

    if (group.status !== "ACTIVE") {
      return res.status(400).json({ message: "Ranges can only be applied to an active section" });
    }
    if (!group.studentIdRanges || group.studentIdRanges.length === 0) {
      return res.status(400).json({ message: "This section has no student ID ranges yet" });
    }

    const result = await applyGroupRanges(group, { moveExisting: !!req.body?.moveExisting });
    res.json({ group: await populateGroup(group._id), result });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
};

module.exports = {
  setGroupRanges,
  applyRanges,
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  assignMentor,
  assignStudents,
  unassignStudent,
  deleteGroup,
  getMyGroup,
};