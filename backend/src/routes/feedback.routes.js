const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const {
  submitFeedback,
  getMyFeedbackHistory,
  getSessionFeedback,
  getMyFeedbackOverview,
  getSessionFeedbackSummary,
} = require("../controllers/feedback.controller"); // lowercase "f" — matches the actual filename on disk

router.use(protect);

router.post("/", authorize("STUDENT"), submitFeedback);
router.get("/me", authorize("STUDENT"), getMyFeedbackHistory);
router.get("/overview", authorize("MENTOR"), getMyFeedbackOverview);
router.get("/session/:sessionId/summary", authorize("ADMIN", "MENTOR"), getSessionFeedbackSummary);
router.get("/session/:sessionId", authorize("ADMIN", "MENTOR"), getSessionFeedback);

module.exports = router;