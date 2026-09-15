const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const {
  getMentorRating,
  getMyRating,
  submitEvaluation,
  getMyEvaluations,
  getEvaluationStatus,
} = require("../controllers/evaluation.controller");

router.use(protect);

router.get("/rating/:mentorId", authorize("ADMIN", "MENTOR", "STUDENT"), getMentorRating);
router.get("/mentor/me", authorize("MENTOR"), getMyRating); // before "/:id"-style routes if you add any later
router.post("/", authorize("STUDENT"), submitEvaluation);
router.get("/me", authorize("STUDENT"), getMyEvaluations);
router.get("/status", authorize("STUDENT"), getEvaluationStatus);

module.exports = router;