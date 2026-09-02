const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} = require("../controllers/blog.controllers");

router.use(protect);

router.get("/", getBlogs);
router.get("/:id", getBlogById);
router.post("/", authorize("ADMIN", "MENTOR"), createBlog);
router.put("/:id", authorize("ADMIN", "MENTOR"), updateBlog);
router.delete("/:id", authorize("ADMIN", "MENTOR"), deleteBlog);

module.exports = router;