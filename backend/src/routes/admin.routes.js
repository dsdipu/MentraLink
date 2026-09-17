const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const { getAdmins, createAdmin, updateAdmin, toggleAdminStatus } = require("../controllers/admin.controller");

router.use(protect, authorize("ADMIN"));

router.get("/", getAdmins);
router.post("/", createAdmin);
router.put("/:id", updateAdmin);
router.patch("/:id/toggle-status", toggleAdminStatus);

module.exports = router;