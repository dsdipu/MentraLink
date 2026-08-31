const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  assignMentor,
  assignStudents,
  deleteGroup,
} = require("../controllers/group.controller");

router.use(protect);

router.post("/", authorize("ADMIN"), createGroup);
router.get("/", authorize("ADMIN", "MENTOR", "STUDENT"), getGroups);
router.get("/:id", authorize("ADMIN", "MENTOR", "STUDENT"), getGroupById);
router.put("/:id", authorize("ADMIN"), updateGroup);
router.patch("/:id/assign-mentor", authorize("ADMIN"), assignMentor);
router.patch("/:id/assign-students", authorize("ADMIN"), assignStudents);
router.delete("/:id", authorize("ADMIN"), deleteGroup);

module.exports = router;