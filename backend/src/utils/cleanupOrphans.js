require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Student = require("../models/Student");
const Mentor = require("../models/Mentor");
const MentorshipGroup = require("../models/MentorshipGroup");

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Scanning for orphaned records...");

  let removedStudents = 0;
  let removedMentors = 0;
  let cleanedGroups = 0;

  const students = await Student.find();
  for (const s of students) {
    const userExists = await User.exists({ _id: s.user });
    if (!userExists) {
      console.log(`Deleting orphaned Student ${s._id} (studentId: ${s.studentId})`);
      await Student.findByIdAndDelete(s._id);
      removedStudents++;
    }
  }

  const mentors = await Mentor.find();
  for (const m of mentors) {
    const userExists = await User.exists({ _id: m.user });
    if (!userExists) {
      console.log(`Deleting orphaned Mentor ${m._id}`);
      await Mentor.findByIdAndDelete(m._id);
      removedMentors++;
    }
  }

  // also strip any dangling student references left inside group.students arrays
  const groups = await MentorshipGroup.find();
  for (const g of groups) {
    const validIds = [];
    for (const studentId of g.students) {
      const exists = await Student.exists({ _id: studentId });
      if (exists) validIds.push(studentId);
    }
    if (validIds.length !== g.students.length) {
      g.students = validIds;
      await g.save();
      cleanedGroups++;
    }
  }

  console.log(`Done. Removed ${removedStudents} orphaned student(s), ${removedMentors} orphaned mentor(s), cleaned ${cleanedGroups} group(s).`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});