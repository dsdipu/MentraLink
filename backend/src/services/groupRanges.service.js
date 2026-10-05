// Student-ID range rules for mentorship sections.
// A section can own one or more ranges (e.g. 262034001-262034017). Students inside a range
// are assigned to that section automatically, both for existing students (apply) and for
// students who are created / approved later (autoAssignStudent).

const MentorshipGroup = require("../models/MentorshipGroup");
const Student = require("../models/Student");

const ID_PATTERN = /^\d{9}$/;
const MAX_RANGES_PER_GROUP = 20;

const inRange = (studentId, range) => studentId >= range.start && studentId <= range.end; // 9-digit strings compare numerically

// Returns { ranges } (sorted, trimmed) or { error }
const normalizeRanges = (input) => {
  if (!Array.isArray(input)) return { error: "Ranges must be a list" };
  if (input.length > MAX_RANGES_PER_GROUP) {
    return { error: `A section can have at most ${MAX_RANGES_PER_GROUP} ranges` };
  }

  const ranges = [];
  for (const item of input) {
    const start = String(item?.start ?? "").trim();
    const end = String(item?.end ?? "").trim();
    if (!ID_PATTERN.test(start) || !ID_PATTERN.test(end)) {
      return { error: "Every range needs a 9-digit start ID and end ID" };
    }
    if (start > end) {
      return { error: `Range ${start}-${end} is invalid: the start ID is greater than the end ID` };
    }
    ranges.push({ start, end });
  }

  ranges.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));

  for (let i = 1; i < ranges.length; i++) {
    if (ranges[i].start <= ranges[i - 1].end) {
      return {
        error: `Ranges ${ranges[i - 1].start}-${ranges[i - 1].end} and ${ranges[i].start}-${ranges[i].end} overlap`,
      };
    }
  }
  return { ranges };
};

// A student can only be in one section, so two sections of the same semester must never share an ID.
const findOverlapWithOtherGroups = async (group, ranges) => {
  const others = await MentorshipGroup.find({
    _id: { $ne: group._id },
    semester: group.semester,
    status: "ACTIVE",
    "studentIdRanges.0": { $exists: true },
  }).select("name studentIdRanges");

  for (const other of others) {
    for (const mine of ranges) {
      for (const theirs of other.studentIdRanges) {
        if (mine.start <= theirs.end && theirs.start <= mine.end) {
          return `Range ${mine.start}-${mine.end} overlaps ${theirs.start}-${theirs.end} of section "${other.name}"`;
        }
      }
    }
  }
  return null;
};

// Assigns every existing student of the group's ranges. Already-assigned students in another
// active section are reported as conflicts, unless moveExisting is true (then they are moved).
const applyGroupRanges = async (group, { moveExisting = false } = {}) => {
  const result = {
    assigned: [],
    alreadyIn: 0,
    moved: [],
    conflicts: [],
    batchMismatch: [],
    withoutAccount: 0,
    totalInRanges: 0,
  };

  const ranges = group.studentIdRanges || [];
  if (ranges.length === 0) return result;

  const Semester = require("../models/Semester");
  const semester = await Semester.findById(group.semester).select("batch");
  const batch = semester?.batch || "";

  const students = await Student.find({
    $or: ranges.map((r) => ({ studentId: { $gte: r.start, $lte: r.end } })),
  })
    .select("studentId batch user")
    .populate("user", "name")
    .sort({ studentId: 1 });

  result.totalInRanges = ranges.reduce((sum, r) => sum + (Number(r.end) - Number(r.start) + 1), 0);
  result.withoutAccount = Math.max(0, result.totalInRanges - students.length);

  const memberIds = new Set((group.students || []).map((id) => String(id)));

  const otherGroups = await MentorshipGroup.find({
    _id: { $ne: group._id },
    status: "ACTIVE",
    students: { $in: students.map((s) => s._id) },
  }).select("name students");
  const otherGroupOf = new Map();
  otherGroups.forEach((g) => g.students.forEach((id) => otherGroupOf.set(String(id), g)));

  const toAdd = [];
  const toMove = [];

  for (const student of students) {
    const id = String(student._id);

    if (memberIds.has(id)) {
      result.alreadyIn += 1;
      continue;
    }
    if (batch && student.batch !== batch) {
      result.batchMismatch.push(student.studentId);
      continue;
    }

    const other = otherGroupOf.get(id);
    if (other && !moveExisting) {
      result.conflicts.push({
        studentId: student.studentId,
        name: student.user?.name || "",
        currentSection: other.name,
      });
      continue;
    }

    toAdd.push(student._id);
    if (other) {
      toMove.push({ id: student._id, studentId: student.studentId });
      result.moved.push(student.studentId);
    } else {
      result.assigned.push(student.studentId);
    }
  }

  if (toMove.length > 0) {
    await MentorshipGroup.updateMany(
      { _id: { $ne: group._id }, status: "ACTIVE" },
      { $pull: { students: { $in: toMove.map((m) => m.id) } } }
    );
  }
  if (toAdd.length > 0) {
    await MentorshipGroup.updateOne({ _id: group._id }, { $addToSet: { students: { $each: toAdd } } });
  }

  return result;
};

// Called when a student account appears (created by an admin or approved). Never throws:
// a failure here must not break account creation. Returns the section name or null.
const autoAssignStudent = async (student) => {
  try {
    if (!student || !ID_PATTERN.test(String(student.studentId))) return null;

    const alreadyAssigned = await MentorshipGroup.exists({ students: student._id, status: "ACTIVE" });
    if (alreadyAssigned) return null;

    const candidates = await MentorshipGroup.find({
      status: "ACTIVE",
      studentIdRanges: {
        $elemMatch: { start: { $lte: student.studentId }, end: { $gte: student.studentId } },
      },
    }).populate("semester", "batch");

    const group = candidates.find((g) => !g.semester?.batch || g.semester.batch === student.batch);
    if (!group) return null;

    await MentorshipGroup.updateOne({ _id: group._id }, { $addToSet: { students: student._id } });
    return group.name;
  } catch (err) {
    console.error("Auto-assign failed:", err.message);
    return null;
  }
};

module.exports = {
  MAX_RANGES_PER_GROUP,
  inRange,
  normalizeRanges,
  findOverlapWithOtherGroups,
  applyGroupRanges,
  autoAssignStudent,
};
