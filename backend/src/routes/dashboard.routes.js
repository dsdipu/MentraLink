const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const { getAdminDashboard } = require("../controllers/dashboard.controller");

router.use(protect);

router.get("/admin", authorize("ADMIN"), getAdminDashboard);

module.exports = router;