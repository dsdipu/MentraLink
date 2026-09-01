const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const {
  markAttendance,
  getMyAttendance,
  getAttendanceStats,
  getSessionAttendance,
} = require("../controllers/attendance.controller");

router.use(protect);

router.post("/mark", authorize("ADMIN", "MENTOR"), markAttendance);
router.get("/me", authorize("STUDENT"), getMyAttendance);
router.get("/me/stats", authorize("STUDENT"), getAttendanceStats);
router.get("/session/:sessionId", authorize("ADMIN", "MENTOR"), getSessionAttendance);

module.exports = router;