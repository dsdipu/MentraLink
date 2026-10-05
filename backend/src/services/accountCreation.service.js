// Shared helpers for admin-created student / mentor accounts.
// Temporary credentials: login email = <studentId>@<university domain>, password = <studentId>.
// Such accounts are flagged mustChangePassword, so the temporary password only works
// for the very first login (the user is forced to choose a strong one right after).

const User = require("../models/User");
const Student = require("../models/Student");
const Mentor = require("../models/Mentor");
const { hashPassword } = require("../utils/hashPassword");

const ID_PATTERN = /^\d{9}$/;
const MAX_BULK = 200; // one request creates at most this many accounts
const TEMP_PASSWORD_ROUNDS = 10; // cheaper hash: the temporary password is replaced on first login
const CHUNK_SIZE = 8;

const isValidStudentId = (value) => ID_PATTERN.test(String(value ?? "").trim());

// "@diu.edu.bd" / "diu.edu.bd" -> "@diu.edu.bd"; returns null when it is not a plausible domain
const normalizeDomain = (value) => {
  const text = String(value ?? "").trim().toLowerCase().replace(/^@/, "");
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(text) ? `@${text}` : null;
};

const getDefaultDomain = () => normalizeDomain(process.env.ALLOWED_STUDENT_EMAIL_DOMAIN);

const buildEmail = (studentId, domain) => `${studentId}${domain}`;

// Returns { ids } or { error }
const expandIdRange = (startId, endId) => {
  const start = String(startId ?? "").trim();
  const end = String(endId ?? "").trim();

  if (!isValidStudentId(start) || !isValidStudentId(end)) {
    return { error: "Start ID and end ID must both be 9-digit student IDs" };
  }
  const from = Number(start);
  const to = Number(end);
  if (from > to) return { error: "Start ID must not be greater than end ID" };

  const count = to - from + 1;
  if (count > MAX_BULK) {
    return { error: `You can create at most ${MAX_BULK} accounts at a time (this range has ${count})` };
  }

  const ids = [];
  for (let n = from; n <= to; n++) ids.push(String(n).padStart(9, "0"));
  return { ids };
};

// Which of these student IDs are already in use (as a user, a student or a mentor)?
const findTakenIds = async (ids, domain) => {
  const emails = ids.map((id) => buildEmail(id, domain));
  const [users, students, mentors] = await Promise.all([
    User.find({ $or: [{ email: { $in: emails } }, { submittedStudentId: { $in: ids } }] }).select(
      "email submittedStudentId"
    ),
    Student.find({ studentId: { $in: ids } }).select("studentId"),
    Mentor.find({ mentorStudentId: { $in: ids } }).select("mentorStudentId"),
  ]);

  const taken = new Set();
  users.forEach((u) => {
    if (u.submittedStudentId) taken.add(u.submittedStudentId);
    const local = String(u.email || "").split("@")[0];
    if (ID_PATTERN.test(local)) taken.add(local);
  });
  students.forEach((s) => taken.add(s.studentId));
  mentors.forEach((m) => m.mentorStudentId && taken.add(m.mentorStudentId));
  return taken;
};

// Creates one student account (user + student profile). Rolls the user back if the profile fails.
const createTemporaryStudent = async ({ studentId, name, email, department = "" }) => {
  const user = await User.create({
    name: name || studentId, // the student can add their real name on first login
    email,
    password: await hashPassword(studentId, TEMP_PASSWORD_ROUNDS),
    role: "STUDENT",
    isActive: true,
    submittedStudentId: studentId,
    batch: studentId.slice(0, 3),
    mustChangePassword: true,
  });

  try {
    await Student.create({
      user: user._id,
      studentId,
      department,
      batch: studentId.slice(0, 3),
    });
  } catch (err) {
    await User.deleteOne({ _id: user._id });
    throw err;
  }
  return user;
};

// Creates accounts for every free ID in the range, skipping IDs that already exist.
const bulkCreateStudents = async ({ startId, endId, department = "", emailDomain }) => {
  const domain = normalizeDomain(emailDomain) || getDefaultDomain();
  if (!domain) {
    return { status: 400, body: { message: "Email domain is required (for example @diu.edu.bd)" } };
  }

  const range = expandIdRange(startId, endId);
  if (range.error) return { status: 400, body: { message: range.error } };

  const taken = await findTakenIds(range.ids, domain);
  const freeIds = range.ids.filter((id) => !taken.has(id));

  const created = [];
  const failed = [];
  const cleanDepartment = String(department || "").trim().slice(0, 100);

  for (let i = 0; i < freeIds.length; i += CHUNK_SIZE) {
    const chunk = freeIds.slice(i, i + CHUNK_SIZE);
    const results = await Promise.allSettled(
      chunk.map((studentId) =>
        createTemporaryStudent({
          studentId,
          email: buildEmail(studentId, domain),
          department: cleanDepartment,
        })
      )
    );
    results.forEach((result, index) => {
      const studentId = chunk[index];
      if (result.status === "fulfilled") {
        created.push({ studentId, email: buildEmail(studentId, domain) });
      } else {
        failed.push({ studentId, reason: "Could not be created" });
      }
    });
  }

  const skipped = range.ids
    .filter((id) => taken.has(id))
    .map((studentId) => ({ studentId, reason: "Already registered" }));

  return {
    status: 201,
    body: {
      summary: {
        requested: range.ids.length,
        created: created.length,
        skipped: skipped.length,
        failed: failed.length,
      },
      created,
      skipped,
      failed,
      note: "Login email is the student ID + domain and the temporary password is the student ID. Students must change it on first login.",
    },
  };
};

module.exports = {
  MAX_BULK,
  isValidStudentId,
  normalizeDomain,
  getDefaultDomain,
  buildEmail,
  expandIdRange,
  findTakenIds,
  createTemporaryStudent,
  bulkCreateStudents,
};
