const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  register,
  login,
  getPendingUsers,
} = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);

router.get(
  "/pending",
  protect,
  authorize("ADMIN"),
  getPendingUsers
);

module.exports = router;