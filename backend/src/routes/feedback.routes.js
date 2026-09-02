const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const {
  submitFeedback,
  getMyFeedbackHistory,
  getSessionFeedback,
} = require("../controllers/Feedback.controller");

router.use(protect);

router.post("/", authorize("STUDENT"), submitFeedback);
router.get("/me", authorize("STUDENT"), getMyFeedbackHistory);
router.get("/session/:sessionId", authorize("ADMIN", "MENTOR"), getSessionFeedback);

module.exports = router;