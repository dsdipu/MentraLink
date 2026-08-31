const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes");
const mentorRoutes = require("./routes/mentor.routes");
const semesterRoutes = require("./routes/semester.routes");

const app = express();

app.use("/api/semesters", semesterRoutes);

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/students", studentRoutes);

app.use("/api/mentors", mentorRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;

