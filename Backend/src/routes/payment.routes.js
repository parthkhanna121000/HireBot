const express = require("express");
const { authUser } = require("../middlewares/auth.middleware");
const {
  createOrder,
  verifyPayment,
  handleWebhook,
  getSubscriptionStatus,
} = require("../controllers/payment.controller");

const paymentRouter = express.Router();

// ⚠️ Webhook MUST use raw body — mounted BEFORE express.json() in server.js
// The inline express.raw() here ensures only this route receives raw bytes.
paymentRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook,
);

// Authenticated routes
paymentRouter.use(authUser);

paymentRouter.post("/create-order", createOrder);
paymentRouter.post("/verify", verifyPayment);
paymentRouter.get("/status", getSubscriptionStatus);

module.exports = paymentRouter;
