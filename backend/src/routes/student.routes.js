// const express = require("express");
// const router = express.Router();
// const protect = require("../middleware/auth.middleware");
// const authorize = require("../middleware/role.middleware");
// const {
//   createStudent,
//   getStudents,
//   getStudentById,
//   updateStudent,
//   toggleStudentStatus,
// } = require("../controllers/student.controller");

// router.use(protect);

// router.post("/", authorize("ADMIN"), createStudent);
// router.get("/", authorize("ADMIN", "MENTOR"), getStudents);
// router.get("/:id", authorize("ADMIN", "MENTOR", "STUDENT"), getStudentById);
// router.put("/:id", authorize("ADMIN"), updateStudent);
// router.patch("/:id/status", authorize("ADMIN"), toggleStudentStatus);

// module.exports = router;






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

router.post("/", authorize("ADMIN"), createStudent);
router.get("/", authorize("ADMIN", "MENTOR"), getStudents);

// NOTE: /me must come BEFORE /:id, otherwise Express treats "me" as an :id param
router.get("/me", authorize("STUDENT"), getMyProfile);
router.put("/me", authorize("STUDENT"), updateMyProfile);

router.get("/:id", authorize("ADMIN", "MENTOR", "STUDENT"), getStudentById);
router.put("/:id", authorize("ADMIN"), updateStudent);
router.patch("/:id/status", authorize("ADMIN"), toggleStudentStatus);

module.exports = router;