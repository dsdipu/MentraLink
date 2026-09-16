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

router.use(protect);

router.get("/", getBlogs);
router.post("/upload-image", authorize("ADMIN", "MENTOR"), upload.single("image"), uploadBlogImage);
router.post("/", authorize("ADMIN", "MENTOR"), createBlog);
router.get("/:id", getBlogById);
router.put("/:id", authorize("ADMIN", "MENTOR"), updateBlog);
router.delete("/:id", authorize("ADMIN", "MENTOR"), deleteBlog);

module.exports = router;