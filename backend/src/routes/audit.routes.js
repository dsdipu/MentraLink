const express = require("express");
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const { getAuditLogs } = require("../controllers/audit.controller");

const router = express.Router();

router.use(protect);
router.get("/", authorize("ADMIN"), getAuditLogs);

module.exports = router;
