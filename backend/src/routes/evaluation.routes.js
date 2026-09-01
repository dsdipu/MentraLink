const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const { getMentorRating } = require("../controllers/evaluation.controller");

router.use(protect);

router.get("/rating/:mentorId", authorize("ADMIN", "MENTOR", "STUDENT"), getMentorRating);

module.exports = router;