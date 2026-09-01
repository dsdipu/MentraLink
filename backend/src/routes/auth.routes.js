const express = require("express");

const router = express.Router();
const { login, register, approveUser, getPendingUsers, rejectUser } = require("../controllers/auth.controller");

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
router.delete("/reject/:id", protect, authorize("ADMIN"), rejectUser);


module.exports = router;