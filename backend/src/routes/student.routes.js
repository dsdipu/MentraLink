const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  toggleStudentStatus,
  getMyProfile,
  updateMyProfile,
} = require("../controllers/student.controller");

router.use(protect);

// Admin: create student
router.post(
  "/",
  authorize("ADMIN"),
  createStudent
);

// Admin/Mentor: get all students
router.get(
  "/",
  authorize("ADMIN", "MENTOR"),
  getStudents
);

// Student: get own profile
// Must come before /:id
router.get(
  "/me",
  authorize("STUDENT"),
  getMyProfile
);

// Student: update own profile
router.put(
  "/me",
  authorize("STUDENT"),
  updateMyProfile
);

// Get student by ID
router.get(
  "/:id",
  authorize("ADMIN", "MENTOR", "STUDENT"),
  getStudentById
);

// Admin: update student
router.put(
  "/:id",
  authorize("ADMIN"),
  updateStudent
);

// Admin: activate/deactivate student
router.patch(
  "/:id/status",
  authorize("ADMIN"),
  toggleStudentStatus
);

module.exports = router;

