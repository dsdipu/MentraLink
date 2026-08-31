const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;