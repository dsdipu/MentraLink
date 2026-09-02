const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const {
  getAdminDashboard,
  getStudentDashboard,
  getMentorDashboard,
} = require("../controllers/dashboard.controller");

router.use(protect);

router.get("/admin", authorize("ADMIN"), getAdminDashboard);
router.get("/student", authorize("STUDENT"), getStudentDashboard);
router.get("/mentor", authorize("MENTOR"), getMentorDashboard);

module.exports = router;