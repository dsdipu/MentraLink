const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const {
  getMentorRating,
  submitEvaluation,
  getMyEvaluations,
  getEvaluationStatus,
} = require("../controllers/evaluation.controller");

router.use(protect);

router.get("/rating/:mentorId", authorize("ADMIN", "MENTOR", "STUDENT"), getMentorRating);
router.post("/", authorize("STUDENT"), submitEvaluation);
router.get("/me", authorize("STUDENT"), getMyEvaluations);
router.get("/status", authorize("STUDENT"), getEvaluationStatus);

module.exports = router;