const crypto = require("crypto");
const Razorpay = require("razorpay");
const User = require("../models/user.model");
const { pushNotification } = require("./notification.controller");
const { sendPaymentConfirmationEmail } = require("../services/email.service");

// ─── RAZORPAY INSTANCE ────────────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── PLAN CONFIG ─────────────────────────────────────────────────────────────
const PLANS = {
  pro_monthly: { name: "Pro Monthly", amountINR: 49900, durationDays: 30 },
  pro_annual: { name: "Pro Annual", amountINR: 399900, durationDays: 365 },
};

// ─── 1. CREATE ORDER ─────────────────────────────────────────────────────────
// POST /api/payments/create-order
const createOrder = async (req, res) => {
  try {
    const { planKey } = req.body;
    const plan = PLANS[planKey];
    if (!plan) return res.status(400).json({ message: "Invalid plan" });

    // Razorpay receipt must be <= 40 chars
    const shortId = req.user.id.toString().slice(-6);
    const shortTs = Date.now().toString().slice(-8);
    const receipt = `hb_${shortId}_${shortTs}`; // ~18 chars, always safe

    const order = await razorpay.orders.create({
      amount: plan.amountINR,
      currency: "INR",
      receipt,
      notes: { userId: req.user.id, planKey },
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      plan: plan.name,
    });
  } catch (err) {
    console.error("[payment] createOrder:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
};

// ─── 2. VERIFY PAYMENT ────────────────────────────────────────────────────────
// POST /api/payments/verify
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planKey,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !planKey
    )
      return res.status(400).json({ message: "Missing payment fields" });

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature)
      return res.status(400).json({ message: "Invalid payment signature" });

    const plan = PLANS[planKey];
    if (!plan) return res.status(400).json({ message: "Invalid plan" });

    const now = new Date();
    const expiry = new Date(
      now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000,
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        plan: "pro",
        subscriptionId: razorpay_payment_id,
        planStartDate: now,
        planExpiryDate: expiry,
        "usage.resumeAnalyses": 0,
        "usage.interviewReports": 0,
        "usage.lastResetDate": now,
      },
      { new: true },
    );

    // Non-blocking side effects
    pushNotification({
      userId: user._id,
      type: "payment",
      title: "Pro Plan Activated 🚀",
      message: `Your HireBot Pro plan is active until ${expiry.toLocaleDateString()}.`,
      link: "/dashboard",
    });

    sendPaymentConfirmationEmail({
      to: user.email,
      name: user.username,
      plan: "pro",
      expiryDate: expiry,
      amount: plan.amountINR,
    });

    res.json({
      message: "Payment verified. Pro plan activated!",
      plan: user.plan,
      planExpiryDate: user.planExpiryDate,
    });
  } catch (err) {
    console.error("[payment] verifyPayment:", err);
    res.status(500).json({ message: "Payment verification failed" });
  }
};

// ─── 3. WEBHOOK ───────────────────────────────────────────────────────────────
// POST /api/payments/webhook
// ⚠️ This route uses express.raw() — mounted BEFORE express.json() in app.js
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const expectedSig = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body) // raw buffer
      .digest("hex");

    if (expectedSig !== signature) {
      console.warn("[webhook] Signature mismatch — rejected");
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = JSON.parse(req.body.toString());
    console.log(`[webhook] event: ${event.event}`);

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const { userId, planKey } = payment.notes || {};

      if (!userId || !planKey) return res.json({ received: true });

      const plan = PLANS[planKey];
      if (!plan) return res.json({ received: true });

      const now = new Date();
      const expiry = new Date(
        now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000,
      );

      const user = await User.findByIdAndUpdate(
        userId,
        {
          plan: "pro",
          subscriptionId: payment.id,
          planStartDate: now,
          planExpiryDate: expiry,
          "usage.resumeAnalyses": 0,
          "usage.interviewReports": 0,
        },
        { new: true },
      );

      if (user) {
        pushNotification({
          userId: user._id,
          type: "payment",
          title: "Pro Plan Activated 🚀",
          message: `Your HireBot Pro plan is active until ${expiry.toLocaleDateString()}.`,
          link: "/dashboard",
        });
        sendPaymentConfirmationEmail({
          to: user.email,
          name: user.username,
          plan: "pro",
          expiryDate: expiry,
          amount: payment.amount,
        });
        console.log(`[webhook] User ${userId} upgraded to PRO`);
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error("[webhook] Error:", err);
    res.status(500).json({ message: "Webhook processing failed" });
  }
};

// ─── 4. SUBSCRIPTION STATUS ──────────────────────────────────────────────────
// GET /api/payments/status
const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "plan subscriptionId planStartDate planExpiryDate usage",
    );

    const isExpired =
      user.plan === "pro" &&
      user.planExpiryDate &&
      new Date() > new Date(user.planExpiryDate);

    if (isExpired) {
      user.plan = "free";
      await user.save();
    }

    res.json({
      plan: user.plan,
      subscriptionId: user.subscriptionId,
      planStartDate: user.planStartDate,
      planExpiryDate: user.planExpiryDate,
      usage: user.usage,
      isExpired,
    });
  } catch (err) {
    console.error("[payment] getSubscriptionStatus:", err);
    res.status(500).json({ message: "Failed to get subscription status" });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
  getSubscriptionStatus,
};
