const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const profileUpload = require("../middleware/profileUpload.middleware");
const {
  createMentor,
  getMentors,
  getMentorById,
  updateMentor,
  toggleMentorStatus,
  getMyProfile,
  updateMyProfile,
  uploadMyPhoto,
  removeMyPhoto,
  getMyStudents,
} = require("../controllers/mentor.controller");

router.use(protect);

router.post("/", authorize("ADMIN"), createMentor);
router.get("/", authorize("ADMIN", "STUDENT"), getMentors);

router.get("/me", authorize("MENTOR"), getMyProfile);
router.put("/me", authorize("MENTOR"), updateMyProfile);
router.post("/me/photo", authorize("MENTOR"), profileUpload.single("photo"), uploadMyPhoto);
router.delete("/me/photo", authorize("MENTOR"), removeMyPhoto);
router.get("/me/students", authorize("MENTOR"), getMyStudents);

router.get("/:id", authorize("ADMIN", "MENTOR", "STUDENT"), getMentorById);
router.put("/:id", authorize("ADMIN"), updateMentor);
router.patch("/:id/status", authorize("ADMIN"), toggleMentorStatus);

module.exports = router;