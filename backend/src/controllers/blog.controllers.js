const Blog = require("../models/Blog");

// Mentor/Admin: notun blog create
const createBlog = async (req, res) => {
  try {
    const { title, content, category, session, coverImage } = req.body;
    const blog = await Blog.create({
      title,
      content,
      category,
      session: session || undefined,
      coverImage,
      author: req.user.id,
    });
    res.status(201).json({ blog });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Shobai: blog list (category / session diye filter kora jai)
const getBlogs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.session) filter.session = req.query.session;

    const blogs = await Blog.find(filter)
      .populate("author", "name")
      .populate("session", "title")
      .sort({ createdAt: -1 });

    res.json({ blogs });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Shobai: single blog details
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author", "name")
      .populate("session", "title date");
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json({ blog });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Author/Admin: blog update
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json({ blog });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Author/Admin: blog delete
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json({ message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog };