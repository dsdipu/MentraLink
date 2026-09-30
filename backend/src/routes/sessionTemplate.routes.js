const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const {
  getSessionTemplates,
  getMyMentorSessionTemplates,
  getSessionTemplateById,
  createSessionTemplate,
  updateSessionTemplate,
  deleteSessionTemplate,
} = require("../controllers/sessionTemplate.controller");

router.use(protect);
router.get("/mentor/me", authorize("MENTOR"), getMyMentorSessionTemplates);

router.use(authorize("ADMIN"));

router.get("/", getSessionTemplates);
router.get("/:id", getSessionTemplateById);
router.post("/", createSessionTemplate);
router.put("/:id", updateSessionTemplate);
router.delete("/:id", deleteSessionTemplate);

module.exports = router;
