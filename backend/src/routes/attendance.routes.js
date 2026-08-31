const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const { markAttendance } = require("../controllers/attendance.controller");

router.use(protect);

router.post("/mark", authorize("ADMIN", "MENTOR"), markAttendance);

module.exports = router;
