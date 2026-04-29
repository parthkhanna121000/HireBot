const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// ── CORS must be FIRST — before every route including payments ────────────────
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = ["http://localhost:5173", process.env.CLIENT_URL];
      // Allow any vercel.app preview URL
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /https:\/\/hire-.*\.vercel\.app$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ── Webhook route needs raw body BEFORE express.json() parses it ──────────────
const paymentRouter = require("./routes/payment.routes");
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// ── General middleware ─────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");
const resumeRouter = require("./routes/resume.routes");
const jobRouter = require("./routes/job.routes");
const applicationRouter = require("./routes/application.routes");
const notificationRouter = require("./routes/notification.routes");
// const adminRouter = require("../routes/admin.routes");
const adminRouter = require("./routes/admin.routes");
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/resume", resumeRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/applications", applicationRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/admin", adminRouter);

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
