const User = require("../models/user.model");

// ─── PLAN LIMITS ─────────────────────────────────────────────────────────────
const PLAN_LIMITS = {
  free: {
    resumeAnalyses: 999999,
    interviewReports: 999999,
  },
  pro: {
    resumeAnalyses: Infinity,
    interviewReports: Infinity,
  },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const isNewDay = (lastResetDate) => {
  const last = new Date(lastResetDate);
  const now = new Date();
  return (
    last.getDate() !== now.getDate() ||
    last.getMonth() !== now.getMonth() ||
    last.getFullYear() !== now.getFullYear()
  );
};

const isNewMonth = (lastResetDate) => {
  const last = new Date(lastResetDate);
  const now = new Date();
  return (
    last.getMonth() !== now.getMonth() ||
    last.getFullYear() !== now.getFullYear()
  );
};

// ─── ENSURE usage OBJECT EXISTS ──────────────────────────────────────────────
// Older documents may have no `usage` field at all — initialise in-place.
const ensureUsage = (user) => {
  if (!user.usage) {
    user.usage = {
      resumeAnalyses: 0,
      interviewReports: 0,
      lastResetDate: new Date(0),
    };
  }
  if (user.usage.resumeAnalyses == null) user.usage.resumeAnalyses = 0;
  if (user.usage.interviewReports == null) user.usage.interviewReports = 0;
  if (!user.usage.lastResetDate) user.usage.lastResetDate = new Date(0);
};

// ─── MIDDLEWARE FACTORY ───────────────────────────────────────────────────────
const checkPlanLimit = (feature) => async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    // Auto-expire pro plan if past expiry date
    if (
      user.plan === "pro" &&
      user.planExpiryDate &&
      new Date() > new Date(user.planExpiryDate)
    ) {
      user.plan = "free";
      await user.save();
    }

    // Pro users: unlimited — pass through immediately
    if (user.plan === "pro") return next();

    // ── FREE PLAN LIMITS ──────────────────────────────────────────────────────
    const limit = PLAN_LIMITS.free[feature];

    // Guarantee usage object exists before any read/write
    ensureUsage(user);

    // Reset counters if period has passed
    if (feature === "resumeAnalyses" && isNewMonth(user.usage.lastResetDate)) {
      user.usage.resumeAnalyses = 0;
      user.usage.lastResetDate = new Date();
      await user.save();
    }

    if (feature === "interviewReports" && isNewDay(user.usage.lastResetDate)) {
      user.usage.interviewReports = 0;
      user.usage.lastResetDate = new Date();
      await user.save();
    }

    const current = user.usage[feature];

    if (current >= limit) {
      const resetMsg =
        feature === "resumeAnalyses"
          ? "You've used all 3 free resume analyses this month."
          : "You've used your 1 free interview report for today.";

      return res.status(403).json({
        message: resetMsg,
        limitReached: true,
        feature,
        limit,
        current,
        upgradeRequired: true,
      });
    }

    req.planLimit = { feature, limit, current, remaining: limit - current };
    next();
  } catch (err) {
    console.error("[checkPlanLimit]:", err);
    res.status(500).json({ message: "Plan check failed" });
  }
};

// ─── INCREMENT USAGE ─────────────────────────────────────────────────────────
const incrementUsage = async (userId, feature) => {
  try {
    await User.findByIdAndUpdate(userId, {
      $inc: { [`usage.${feature}`]: 1 },
    });
  } catch (err) {
    console.error(`[incrementUsage] ${feature}:`, err.message);
  }
};

module.exports = { checkPlanLimit, incrementUsage, PLAN_LIMITS };
