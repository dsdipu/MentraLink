const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");
const {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  uploadBlogImage,
} = require("../controllers/blog.controllers");

// Public — anyone can read blogs, no login required
router.get("/", getBlogs);
router.get("/:id", getBlogById);

// Everything else requires auth
router.use(protect);
router.post("/upload-image", authorize("ADMIN", "MENTOR"), upload.single("image"), uploadBlogImage);
router.post("/", authorize("ADMIN", "MENTOR"), createBlog);
router.put("/:id", authorize("ADMIN", "MENTOR"), updateBlog);
router.delete("/:id", authorize("ADMIN", "MENTOR"), deleteBlog);

module.exports = router;