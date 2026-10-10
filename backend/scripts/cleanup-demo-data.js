// DANGER: deletes EVERYTHING except admin accounts and semesters
// (students, mentors, sessions, sections, attendance, feedback, evaluations, blogs, comments, codes).
// It does nothing unless you explicitly confirm:
//
//   node scripts/cleanup-demo-data.js --confirm
//
// and it refuses to run when NODE_ENV=production (unless --allow-production is added as well).
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const args = process.argv.slice(2);
if (!args.includes("--confirm")) {
  console.error("This script deletes all demo data (everything except admins and semesters).");
  console.error("Run it again with --confirm if that is really what you want.");
  process.exit(1);
}
if (process.env.NODE_ENV === "production" && !args.includes("--allow-production")) {
  console.error("Refusing to run with NODE_ENV=production. Add --allow-production only if you are absolutely sure.");
  process.exit(1);
}

const mongoose = require("mongoose");

const User = require("../src/models/User");
const Student = require("../src/models/Student");
const Mentor = require("../src/models/Mentor");
const Blog = require("../src/models/Blog");
const Comment = require("../src/models/Comment");
const Attendance = require("../src/models/Attendance");
const Feedback = require("../src/models/Feedback");
const MentorEvaluation = require("../src/models/MentorEvaluation");
const Session = require("../src/models/Session");
const MentorshipGroup = require("../src/models/MentorshipGroup");
const Otp = require("../src/models/Otp");

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB");
    console.log("Starting demo data cleanup...");

    const adminCount = await User.countDocuments({ role: "ADMIN" });
    const studentCount = await Student.countDocuments();
    const mentorCount = await Mentor.countDocuments();
    const blogCount = await Blog.countDocuments();
    const commentCount = await Comment.countDocuments();
    const attendanceCount = await Attendance.countDocuments();
    const feedbackCount = await Feedback.countDocuments();
    const evaluationCount = await MentorEvaluation.countDocuments();
    const sessionCount = await Session.countDocuments();
    const groupCount = await MentorshipGroup.countDocuments();
    const otpCount = await Otp.countDocuments();

    console.log("");
    console.log("Data to be deleted:");
    console.log(`Students: ${studentCount}`);
    console.log(`Mentors: ${mentorCount}`);
    console.log(`Blogs: ${blogCount}`);
    console.log(`Comments: ${commentCount}`);
    console.log(`Attendance: ${attendanceCount}`);
    console.log(`Feedback: ${feedbackCount}`);
    console.log(`Mentor evaluations: ${evaluationCount}`);
    console.log(`Sessions: ${sessionCount}`);
    console.log(`Mentorship groups: ${groupCount}`);
    console.log(`OTPs: ${otpCount}`);
    console.log(`Admin accounts to preserve: ${adminCount}`);
    console.log("");

    console.log("Deleting dependent data...");

    const deletedComments = await Comment.deleteMany({});
    const deletedAttendance = await Attendance.deleteMany({});
    const deletedFeedback = await Feedback.deleteMany({});
    const deletedEvaluations = await MentorEvaluation.deleteMany({});
    const deletedBlogs = await Blog.deleteMany({});
    const deletedSessions = await Session.deleteMany({});
    const deletedGroups = await MentorshipGroup.deleteMany({});
    const deletedOtps = await Otp.deleteMany({});

    console.log("Deleting mentor and student profiles...");

    const deletedStudents = await Student.deleteMany({});
    const deletedMentors = await Mentor.deleteMany({});

    console.log("Deleting non-admin users...");

    const deletedUsers = await User.deleteMany({
      role: { $ne: "ADMIN" },
    });

    console.log("");
    console.log("Cleanup completed successfully.");
    console.log("");
    console.log(`Admins preserved: ${adminCount}`);
    console.log(`Users deleted: ${deletedUsers.deletedCount}`);
    console.log(`Students deleted: ${deletedStudents.deletedCount}`);
    console.log(`Mentors deleted: ${deletedMentors.deletedCount}`);
    console.log(`Blogs deleted: ${deletedBlogs.deletedCount}`);
    console.log(`Comments deleted: ${deletedComments.deletedCount}`);
    console.log(`Attendance deleted: ${deletedAttendance.deletedCount}`);
    console.log(`Feedback deleted: ${deletedFeedback.deletedCount}`);
    console.log(`Mentor evaluations deleted: ${deletedEvaluations.deletedCount}`);
    console.log(`Sessions deleted: ${deletedSessions.deletedCount}`);
    console.log(`Mentorship groups deleted: ${deletedGroups.deletedCount}`);
    console.log(`OTPs deleted: ${deletedOtps.deletedCount}`);
    console.log("");
    console.log("Only ADMIN users and existing Semester records remain.");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Cleanup failed:", err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();