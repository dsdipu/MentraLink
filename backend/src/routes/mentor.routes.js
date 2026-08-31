const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const {
  createMentor,
  getMentors,
  getMentorById,
  updateMentor,
  toggleMentorStatus,
} = require("../controllers/mentor.controller");

router.use(protect);

router.post("/", authorize("ADMIN"), createMentor);
router.get("/", authorize("ADMIN", "STUDENT"), getMentors);
router.get("/:id", authorize("ADMIN", "MENTOR", "STUDENT"), getMentorById);
router.put("/:id", authorize("ADMIN"), updateMentor);
router.patch("/:id/status", authorize("ADMIN"), toggleMentorStatus);

module.exports = router;