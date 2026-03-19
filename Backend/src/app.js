const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// ── Routes ────────────────────────────────────────────────────────────────────
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");
const resumeRouter = require("./routes/resume.routes");
const jobRouter = require("./routes/job.routes");
const applicationRouter = require("./routes/application.routes");

app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter); // existing feature kept
app.use("/api/resume", resumeRouter); // core HireBot feature
app.use("/api/jobs", jobRouter);
app.use("/api/applications", applicationRouter);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "HireBot API is running" });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res
    .status(500)
    .json({ message: "Internal server error", error: err.message });
});

module.exports = app;
