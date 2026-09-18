const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const {
  createEmailRequest,
  getEmailRequests,
  updateEmailRequestStatus,
} = require("../controllers/emailRequest.controller");

router.post("/", createEmailRequest); // public

router.use(protect, authorize("ADMIN"));
router.get("/", getEmailRequests);
router.patch("/:id/status", updateEmailRequestStatus);

module.exports = router;