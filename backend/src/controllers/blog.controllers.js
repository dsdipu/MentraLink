const Blog = require("../models/Blog");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
// Mentor/Admin: upload a single image, get back its URL to use inline or in the gallery
const uploadBlogImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      "mentralink/blogs",
      [{ width: 1600, crop: "limit" }]
    );

    res.status(201).json({
      url: result.secure_url,
    });
  } catch (err) {
    console.error("Cloudinary blog upload error:", err);
    res.status(500).json({
      message: "Image upload failed",
      error: err.message,
    });
  }
};

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

const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

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

const Comment = require("../models/Comment"); // add this import at the top of the file

const toggleLike = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const userId = req.user.id;
    const alreadyLiked = blog.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      blog.likes = blog.likes.filter((id) => id.toString() !== userId);
    } else {
      blog.likes.push(userId);
    }
    await blog.save();

    res.json({ likesCount: blog.likes.length, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ blog: req.params.id })
      .populate("author", "name")
      .sort({ createdAt: -1 });
    res.json({ comments });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: "Comment cannot be empty" });

    const comment = await Comment.create({ blog: req.params.id, author: req.user.id, text: text.trim() });
    const populated = await comment.populate("author", "name");
    res.status(201).json({ comment: populated });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (req.user.role !== "ADMIN" && comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog, uploadBlogImage, toggleLike, getComments, addComment, deleteComment };