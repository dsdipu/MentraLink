const User = require("../models/User");
const { hashPassword } = require("../utils/hashPassword");
const { rejectWeakPassword } = require("../utils/passwordPolicy");
const audit = require("../utils/audit");

const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "ADMIN" }).select("-password").sort({ createdAt: 1 });
    res.json({ admins });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !req.body.email) return res.status(400).json({ message: "Name and email are required" });
    const email = String(req.body.email).toLowerCase().trim(); // logins are case-insensitive
    if (rejectWeakPassword(res, password, { email, name })) return;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await hashPassword(password);
    const admin = await User.create({ name, email, password: hashedPassword, role: "ADMIN", isActive: true });
    await audit(req, "ADMIN_CREATED", { target: email });
    res.status(201).json({ admin: { _id: admin._id, name: admin.name, email: admin.email, isActive: admin.isActive } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const update = {};
    if (req.body.name) update.name = String(req.body.name).trim();
    if (req.body.email) update.email = String(req.body.email).toLowerCase().trim();

    const clash = update.email
      ? await User.exists({ email: update.email, _id: { $ne: req.params.id } })
      : null;
    if (clash) return res.status(400).json({ message: "Email already registered" });

    const admin = await User.findOneAndUpdate(
      { _id: req.params.id, role: "ADMIN" },
      update,
      { new: true }
    ).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json({ admin });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

// toggle active/inactive — protected so you can't lock yourself out
const toggleAdminStatus = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You cannot deactivate your own account" });
    }

    const target = await User.findOne({ _id: req.params.id, role: "ADMIN" });
    if (!target) return res.status(404).json({ message: "Admin not found" });

    if (target.isActive) {
      const activeAdminCount = await User.countDocuments({ role: "ADMIN", isActive: true });
      if (activeAdminCount <= 1) {
        return res.status(400).json({ message: "Cannot deactivate the last remaining admin" });
      }
    }

    target.isActive = !target.isActive;
    await target.save();
    await audit(req, target.isActive ? "ADMIN_ACTIVATED" : "ADMIN_DEACTIVATED", { target: target.email });
    res.json({ message: `Admin ${target.isActive ? "activated" : "deactivated"}` });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

module.exports = { getAdmins, createAdmin, updateAdmin, toggleAdminStatus };