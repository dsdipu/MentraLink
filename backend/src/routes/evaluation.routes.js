const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const {
  getMentorRating,
  getMyRating,
  getMyMentorEvaluations,
  getAllMentorRatings,
  submitEvaluation,
  getMyEvaluations,
  getEvaluationStatus,
} = require("../controllers/evaluation.controller");

router.use(protect);

router.get("/all", authorize("ADMIN"), getAllMentorRatings);
router.get("/rating/:mentorId", authorize("ADMIN", "MENTOR", "STUDENT"), getMentorRating);
router.get("/mentor/me", authorize("MENTOR"), getMyRating);
router.get("/mentor/me/list", authorize("MENTOR"), getMyMentorEvaluations);
router.post("/", authorize("STUDENT"), submitEvaluation);
router.get("/me", authorize("STUDENT"), getMyEvaluations);
router.get("/status", authorize("STUDENT"), getEvaluationStatus);

module.exports = router;