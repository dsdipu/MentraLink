const express = require("express");
const router = express.Router();
const { login, register, approveUser, getPendingUsers } = require("../controllers/auth.controller");


router.post("/register", register);
router.post("/login", login);
router.get("/pending", protect, authorize("ADMIN"), getPendingUsers);

module.exports = router;