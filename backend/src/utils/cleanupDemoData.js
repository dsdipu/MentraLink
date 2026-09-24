require("dotenv").config();
const mongoose = require("mongoose");

const User = require("../models/User");
const Student = require("../models/Student");
const Mentor = require("../models/Mentor");
const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const Attendance = require("../models/Attendance");
const Feedback = require("../models/Feedback");
const MentorEvaluation = require("../models/MentorEvaluation");
const Session = require("../models/Session");
const MentorshipGroup = require("../models/MentorshipGroup");
const Otp = require("../models/Otp");

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