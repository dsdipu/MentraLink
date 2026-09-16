const express = require("express");
const cors = require("cors");
const path = require("path");

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

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "https://mms-kappa-ten.vercel.app"],
}));
app.use(express.json());

// serve uploaded blog images
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

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

module.exports = app;