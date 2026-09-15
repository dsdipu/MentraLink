const Blog = require("../models/Blog");

// Mentor/Admin: notun blog create
const createBlog = async (req, res) => {
  try {
    const { title, content, category, session, coverImage, images, links } = req.body;
    const blog = await Blog.create({
      title,
      content,
      category,
      session: session || undefined,
      coverImage,
      images: Array.isArray(images) ? images : [],
      links: Array.isArray(links) ? links : [],
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
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // only the original author or an admin may edit
    if (req.user.role !== "ADMIN" && blog.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to edit this blog" });
    }

    const { title, content, category, session, coverImage, images, links } = req.body;
    if (title !== undefined) blog.title = title;
    if (content !== undefined) blog.content = content;
    if (category !== undefined) blog.category = category;
    if (session !== undefined) blog.session = session || undefined;
    if (coverImage !== undefined) blog.coverImage = coverImage;
    if (images !== undefined) blog.images = images;
    if (links !== undefined) blog.links = links;

    await blog.save();
    res.json({ blog });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Author/Admin: blog delete
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (req.user.role !== "ADMIN" && blog.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this blog" });
    }

    await blog.deleteOne();
    res.json({ message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog };