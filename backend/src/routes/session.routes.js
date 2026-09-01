const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const authorize = require("../middleware/role.middleware");

const {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  updateSessionStatus,
  deleteSession,
  getNextSession,
} = require("../controllers/session.controller");

router.use(protect);

router.post("/", authorize("ADMIN", "MENTOR"), createSession);

router.get("/", authorize("ADMIN", "MENTOR", "STUDENT"), getSessions);

// Get next upcoming session
router.get(
  "/next",
  authorize("ADMIN", "MENTOR", "STUDENT"),
  getNextSession
);

router.get("/:id", authorize("ADMIN", "MENTOR", "STUDENT"), getSessionById);

router.put("/:id", authorize("ADMIN", "MENTOR"), updateSession);

router.patch("/:id/status", authorize("ADMIN", "MENTOR"), updateSessionStatus);

router.delete("/:id", authorize("ADMIN"), deleteSession);

module.exports = router;