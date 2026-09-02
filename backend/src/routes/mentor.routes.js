// const express = require("express");
// const router = express.Router();
// const protect = require("../middleware/auth.middleware");
// const authorize = require("../middleware/role.middleware");
// const {
//   createMentor,
//   getMentors,
//   getMentorById,
//   updateMentor,
//   toggleMentorStatus,
// } = require("../controllers/mentor.controller");

// router.use(protect);

// router.post("/", authorize("ADMIN"), createMentor);
// router.get("/", authorize("ADMIN", "STUDENT"), getMentors);
// router.get("/:id", authorize("ADMIN", "MENTOR", "STUDENT"), getMentorById);
// router.put("/:id", authorize("ADMIN"), updateMentor);
// router.patch("/:id/status", authorize("ADMIN"), toggleMentorStatus);

// module.exports = router;




const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const {
  createMentor,
  getMentors,
  getMentorById,
  updateMentor,
  toggleMentorStatus,
  getMyProfile,
  updateMyProfile,
} = require("../controllers/mentor.controller");

router.use(protect);

router.post("/", authorize("ADMIN"), createMentor);
router.get("/", authorize("ADMIN", "STUDENT"), getMentors);

// NOTE: /me must come BEFORE /:id, otherwise Express treats "me" as an :id param
router.get("/me", authorize("MENTOR"), getMyProfile);
router.put("/me", authorize("MENTOR"), updateMyProfile);

router.get("/:id", authorize("ADMIN", "MENTOR", "STUDENT"), getMentorById);
router.put("/:id", authorize("ADMIN"), updateMentor);
router.patch("/:id/status", authorize("ADMIN"), toggleMentorStatus);

module.exports = router;