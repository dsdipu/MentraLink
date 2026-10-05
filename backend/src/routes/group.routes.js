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
  unassignStudent,
  assignStudents,
  deleteGroup,
  setGroupRanges,
  applyRanges,
} = require("../controllers/group.controller");
const { getMyGroup } = require("../controllers/group.controller"); // already imported above, just add to destructure

router.use(protect);

router.post("/", authorize("ADMIN"), createGroup);
router.get("/me/assigned", authorize("STUDENT"), getMyGroup);
router.get("/", authorize("ADMIN", "MENTOR", "STUDENT"), getGroups);
router.get("/:id", authorize("ADMIN", "MENTOR", "STUDENT"), getGroupById);
router.put("/:id", authorize("ADMIN"), updateGroup);
router.patch("/:id/assign-mentor", authorize("ADMIN"), assignMentor);
router.patch("/:id/assign-students", authorize("ADMIN"), assignStudents);
router.patch(
  "/:id/unassign-student",
  authorize("ADMIN"),
  unassignStudent
);
router.put("/:id/ranges", authorize("ADMIN"), setGroupRanges);
router.post("/:id/apply-ranges", authorize("ADMIN"), applyRanges);
router.delete("/:id", authorize("ADMIN"), deleteGroup);

module.exports = router;