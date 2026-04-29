// requirePlan.middleware.js
const User = require("../models/user.model");

const requirePlan = (requiredPlan) => async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("plan planExpiryDate");
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const isExpired =
      user.plan === "pro" &&
      user.planExpiryDate &&
      new Date() > new Date(user.planExpiryDate);

    const effectivePlan = isExpired ? "free" : user.plan;

    if (requiredPlan === "pro" && effectivePlan !== "pro") {
      return res.status(403).json({
        message: "This feature requires a Pro plan.",
        upgradeRequired: true,
        currentPlan: effectivePlan,
      });
    }

    next();
  } catch (err) {
    console.error("[requirePlan]:", err);
    res.status(500).json({ message: "Plan check failed" });
  }
};

module.exports = { requirePlan };
