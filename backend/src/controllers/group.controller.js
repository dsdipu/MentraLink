const MentorshipGroup = require("../models/MentorshipGroup");

const getMentorModel = () => require("../models/Mentor");
const getStudentModel = () => require("../models/Student");

const createGroup = async (req, res) => {
  try {
    const { name, semester, mentor, students = [], status = "ACTIVE" } =
      req.body;

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
      .populate("semester", "name academicYear status")
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
      error: err.message,
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
      .populate("semester", "name academicYear status")
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
      error: err.message,
    });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await MentorshipGroup.findById(req.params.id)
      .populate("semester", "name academicYear status")
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

    res.json({
      group,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
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
      .populate("semester", "name academicYear status")
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
      error: err.message,
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
      .populate("semester", "name academicYear status")
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
      error: err.message,
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

    const Student = getStudentModel();

    const validStudents = await Student.find({
      _id: { $in: studentIds },
    }).select("_id studentId");

    if (validStudents.length !== studentIds.length) {
      return res.status(400).json({
        message: "One or more selected students do not exist",
      });
    }

    const currentStudentIds = new Set(
      group.students.map((studentId) => studentId.toString())
    );

    const studentsToAdd = studentIds.filter(
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
      .populate("semester", "name academicYear status")
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
      error: err.message,
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
      .populate("semester", "name academicYear status")
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
      error: err.message,
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
      error: err.message,
    });
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
  getMyGroup,
};