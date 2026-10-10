const User = require("../models/User");
const Student = require("../models/Student");
const Mentor = require("../models/Mentor");
const Otp = require("../models/Otp");
const { comparePassword, hashPassword } = require("../utils/hashPassword");
const generateToken = require("../utils/generateToken");
const { uploadIdCard, getIdCardUrl, deleteIdCard } = require("../utils/idCard");
const { rejectWeakPassword } = require("../utils/passwordPolicy");
const { autoAssignStudent } = require("../services/groupRanges.service");
const { authenticate, clearLoginLock } = require("../services/loginSecurity.service");
const { generateOtpCode, checkOtp, requestedRecently } = require("../utils/otpGuard");
const audit = require("../utils/audit");

// A "pending registration" is an inactive STUDENT/MENTOR account that has not been
// approved yet (so it has no Student/Mentor profile). Deactivated, already-approved
// users and admins must never show up in (or be rejected from) the pending list.
const getPendingFilter = async () => {
  const [students, mentors] = await Promise.all([
    Student.find().select("user"),
    Mentor.find().select("user"),
  ]);
  const approvedIds = [...students, ...mentors].map((p) => p.user);
  return {
    isActive: false,
    role: { $in: ["STUDENT", "MENTOR"] },
    _id: { $nin: approvedIds },
  };
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Public registration is only for students and mentors. Admin accounts are
    // created by the seed script or by an existing admin.
    if (!["STUDENT", "MENTOR"].includes(role)) {
      return res.status(400).json({ message: "Role must be STUDENT or MENTOR" });
    }
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (rejectWeakPassword(res, password, { email: normalizedEmail, name })) return;

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    let derivedStudentId, batch;

    if (role === "STUDENT" || role === "MENTOR") {
      const allowedDomain = process.env.ALLOWED_STUDENT_EMAIL_DOMAIN;
      if (allowedDomain && !normalizedEmail.endsWith(allowedDomain.toLowerCase())) {
        return res.status(400).json({
          message: `Please register with your university email (must end with ${allowedDomain})`,
        });
      }

      // student ID is derived from the email itself: XXXYYYZZZ@domain
      const localPart = normalizedEmail.split("@")[0];
      const idMatch = localPart.match(/^(\d{3})(\d{3})(\d{3})$/);
      if (!idMatch) {
        return res.status(400).json({
          message: "Your university email doesn't match the expected student ID format (9 digits before @)",
        });
      }
      derivedStudentId = localPart;
      batch = idMatch[1];

      if (!req.file) {
        return res.status(400).json({ message: "A photo of your student ID card is required" });
      }

      const duplicateId = await User.findOne({ submittedStudentId: derivedStudentId });
      if (duplicateId) {
        return res.status(400).json({ message: "This student ID has already been registered" });
      }

      const verifiedOtp = await Otp.findOne({
        email: normalizedEmail,
        verified: true,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 });

      if (!verifiedOtp) {
        return res.status(400).json({ message: "Please verify your email with the code sent to you before registering" });
      }
    }

    const hashedPassword = await hashPassword(password);
    const isActive = false; // every public registration waits for admin approval

    // memoryStorage gives us a buffer (there is no req.file.path), so upload it ourselves
    const uploadedCard = await uploadIdCard(req.file.buffer);

    let user;
    try {
      user = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role,
        isActive,
        submittedStudentId: derivedStudentId,
        batch,
        idCardPublicId: uploadedCard.public_id,
      });
    } catch (createErr) {
      // don't leave an orphaned ID card in Cloudinary if the account could not be saved
      await deleteIdCard(uploadedCard.public_id);
      throw createErr;
    }

    await Otp.deleteMany({ email: normalizedEmail });

    res.status(201).json({
      message: isActive ? "Account created" : "Registration submitted. Waiting for admin approval.",
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

const approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "STUDENT") {
      const existing = await Student.findOne({ user: user._id });
      if (!existing) {
        let studentId = user.submittedStudentId;
        if (!studentId) {
          const count = await Student.countDocuments();
          studentId = `SWE${String(count + 1).padStart(3, "0")}`;
        }
        const createdStudent = await Student.create({
          user: user._id,
          studentId,
          department: "Software Engineering",
          batch: user.batch || "",
        });
        // joins the section whose student-ID range contains this ID (if any)
        await autoAssignStudent(createdStudent);
      }
    } else if (user.role === "MENTOR") {
      const existing = await Mentor.findOne({ user: user._id });
      if (!existing) {
        await Mentor.create({
          user: user._id,
          mentorStudentId: user.submittedStudentId || "",
          department: "Software Engineering",
          batch: user.batch || "",
        });
      }
    }

    // the ID card was only needed for verification: delete it now that the request is decided
    if (user.idCardPublicId) {
      const removed = await deleteIdCard(user.idCardPublicId);
      if (removed) {
        await User.updateOne(
          { _id: user._id },
          { $unset: { idCardPublicId: "", idCardImage: "" } }
        );
        user.idCardPublicId = undefined;
        user.idCardImage = undefined;
      }
    }

    await audit(req, "USER_APPROVED", { target: `${user.email} (${user.role})` });

    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.failedLoginAttempts;
    delete safeUser.lockUntil;
    res.json({ message: "User approved", user: safeUser });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "That student ID is already in use by another account" });
    }
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

const getPendingUsers = async (req, res) => {
  try {
    const filter = await getPendingFilter();
    const users = await User.find(filter).select("-password").sort({ createdAt: 1 });

    // expose a short-lived-by-design signed URL under the same `idCardImage` key the UI already uses
    const pendingUsers = users.map((u) => {
      const obj = u.toObject();
      obj.idCardImage = getIdCardUrl(obj.idCardPublicId) || undefined;
      delete obj.idCardPublicId;
      return obj;
    });

    res.json({ pendingUsers });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isActive) {
      return res.status(400).json({ message: "Cannot reject an already active user" });
    }

    const [hasStudent, hasMentor] = await Promise.all([
      Student.exists({ user: user._id }),
      Mentor.exists({ user: user._id }),
    ]);
    if (user.role === "ADMIN" || hasStudent || hasMentor) {
      return res.status(400).json({ message: "Only pending registrations can be rejected" });
    }

    await User.findByIdAndDelete(req.params.id);

    // remove the ID card image together with the rejected registration
    const removed = await deleteIdCard(user.idCardPublicId);
    if (!removed) {
      console.error(`ID card ${user.idCardPublicId} of rejected user ${user._id} was not deleted from Cloudinary`);
    }

    await audit(req, "USER_REJECTED", { target: `${user.email} (${user.role})` });

    res.json({ message: "Registration rejected and removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

const verifyTurnstile = async (token, ip) => {
  if (!token) {
    return false;
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: ip || "",
      }),
    }
  );

  const result = await response.json();

  return result.success === true;
};

const login = async (req, res) => {
  try {
    const { email, password, turnstileToken } = req.body;

    const captchaValid = await verifyTurnstile(
      turnstileToken,
      req.ip
    );

    if (!captchaValid) {
      return res.status(400).json({
        message: "Please complete the CAPTCHA verification",
      });
    }
    
    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    const outcome = await authenticate(user, password);

    if (outcome.status === "LOCKED") {
      if (outcome.locked) {
        await audit(req, "ACCOUNT_LOCKED", {
          actor: user._id,
          actorEmail: normalizedEmail,
          actorRole: user.role,
          target: normalizedEmail,
          details: { minutes: outcome.minutes },
        });
      }
      return res.status(429).json({
        message: `Too many failed attempts. Please try again in ${outcome.minutes} minute${
          outcome.minutes === 1 ? "" : "s"
        }, or reset your password.`,
      });
    }

    if (outcome.status !== "OK") {
      await audit(req, "LOGIN_FAILED", {
        actorEmail: normalizedEmail,
        target: normalizedEmail,
        details: { reason: outcome.reason },
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    await audit(req, "LOGIN_SUCCESS", {
      actor: user._id,
      actorEmail: user.email,
      actorRole: user.role,
      target: user.email,
    });

    const token = generateToken(user._id, user.role);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: !!user.mustChangePassword,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // don't reveal whether the email exists — respond the same either way
    if (user && user.isActive && !(await requestedRecently(normalizedEmail))) {
      const code = generateOtpCode();
      await Otp.create({
        email: normalizedEmail,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      const sendEmail = require("../utils/sendEmail");
      await sendEmail({
        to: normalizedEmail,
        subject: "Reset your MentraLink password",
        html: `
          <div style="font-family: sans-serif;">
            <p>Your password reset code is:</p>
            <h2 style="letter-spacing:6px;">${code}</h2>
            <p style="color:#666;font-size:13px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });
    }

    res.json({ message: "If that email is registered, a reset code has been sent." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    if (rejectWeakPassword(res, newPassword, { email: normalizedEmail })) return;

    const otp = await checkOtp(normalizedEmail, code);

    if (!otp) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    // same answer as a wrong code, so this cannot be used to find out which e-mails exist
    if (!user) return res.status(400).json({ message: "Invalid or expired code" });

    if (await comparePassword(newPassword, user.password)) {
      return res.status(400).json({ message: "New password must be different from your current password" });
    }

    user.password = await hashPassword(newPassword);
    user.passwordChangedAt = new Date();
    user.mustChangePassword = false;
    await user.save();
    await clearLoginLock(user._id);
    await audit(req, "PASSWORD_RESET", {
      actor: user._id,
      actorEmail: user.email,
      actorRole: user.role,
      target: user.email,
    });

    await Otp.deleteMany({ email: normalizedEmail });

    res.json({ message: "Password updated. You can now log in." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

const getPendingCount = async (req, res) => {
  try {
    const count = await User.countDocuments(await getPendingFilter());
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

const updateMe = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name }, { new: true }).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    if (rejectWeakPassword(res, newPassword, { email: user.email, name: user.name })) return;

    if (await comparePassword(newPassword, user.password)) {
      return res.status(400).json({ message: "New password must be different from your current password" });
    }

    user.password = await hashPassword(newPassword);
    user.passwordChangedAt = new Date();
    user.mustChangePassword = false; // the temporary password is gone for good
    await user.save();
    await audit(req, "PASSWORD_CHANGED", { target: user.email });

    // other devices are logged out; hand back a fresh token so this session continues
    const token = generateToken(user._id, user.role);
    res.json({ message: "Password changed successfully", token, mustChangePassword: false });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
  }
};

module.exports = { login, register, approveUser, getPendingUsers, rejectUser, forgotPassword, resetPassword, getPendingCount, getMe, updateMe, changePassword };