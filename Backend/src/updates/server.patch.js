import paymentRoutes from "./routes/payment.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
/**
 * SERVER.JS PATCH
 *
 * Shows exactly where and how to add the new routes/middleware.
 * Find the matching section in your existing server.js and apply each change.
 */

// ─── STEP 1: NEW ENV VARIABLES (.env) ─────────────────────────────────────────
/*
# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password_16chars
*/

// ─── STEP 2: NEW PACKAGE INSTALLS ─────────────────────────────────────────────
/*
cd Backend
npm install razorpay nodemailer
*/

// ─── STEP 3: NEW ROUTE IMPORTS (add to your existing imports) ─────────────────
/*
import paymentRoutes      from "./routes/payment.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
*/

// ─── STEP 4: SERVER.JS MOUNTING ORDER ─────────────────────────────────────────
/*
Your server.js setup should look like this (order matters for webhook):

const app = express();

// ✅ CORS first
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(cookieParser());

// ✅ Webhook route BEFORE express.json() — needs raw body
// payment.routes.js handles the raw middleware internally via express.raw()
app.use("/api/payments", paymentRoutes);

// ✅ JSON + URL-encoded for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Existing routes
app.use("/api/auth",         authRoutes);
app.use("/api/resume",       resumeRoutes);
app.use("/api/interview",    interviewRoutes);
app.use("/api/jobs",         jobRoutes);
app.use("/api/applications", applicationRoutes);

// ✅ New routes
app.use("/api/notifications", notificationRoutes);
*/

// ─── STEP 5: VERIFY .env VARIABLES EXIST ─────────────────────────────────────
/*
Add this check near top of server.js:

const REQUIRED_ENV = [
  "MONGODB_URI", "JWT_SECRET",
  "GOOGLE_GENAI_API_KEY_1",
  "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET",
  "SMTP_USER", "SMTP_PASS",
  "FRONTEND_URL"
];

REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) console.warn(`⚠️  Missing env: ${key}`);
});
*/
