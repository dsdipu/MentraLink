const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const {
  createSemester,
  getSemesters,
  getSemesterById,
  updateSemester,
  deleteSemester,
} = require("../controllers/semester.controller");

router.use(protect);

router.post("/", authorize("ADMIN"), createSemester);
router.get("/", authorize("ADMIN", "MENTOR", "STUDENT"), getSemesters);
router.get("/:id", authorize("ADMIN", "MENTOR", "STUDENT"), getSemesterById);
router.put("/:id", authorize("ADMIN"), updateSemester);
router.delete("/:id", authorize("ADMIN"), deleteSemester);

module.exports = router;