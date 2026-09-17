const express = require("express");
const cors = require("cors");
const path = require("path");

const otpRoutes = require("./routes/otp.routes");
const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes");
const mentorRoutes = require("./routes/mentor.routes");
const semesterRoutes = require("./routes/semester.routes");
const groupRoutes = require("./routes/group.routes");
const sessionRoutes = require("./routes/session.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const evaluationRoutes = require("./routes/evaluation.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const blogRoutes = require("./routes/blog.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS
      .split(",")
      .map((origin) => origin.trim().replace(/\/$/, ""))
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.log("CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/test", (req, res) => {
  console.log("TEST BODY:", req.body);
  res.json({
    message: "POST is working",
    body: req.body,
  });
});

app.use("/api/otp", otpRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/semesters", semesterRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/admins", adminRoutes);

module.exports = app;