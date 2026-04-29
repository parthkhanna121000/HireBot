# 🤖 HireBot — AI-Powered Resume Screening System

<div align="center">

![HireBot Banner](https://img.shields.io/badge/HireBot-AI%20Resume%20Screening-185FA5?style=for-the-badge&logo=robot&logoColor=white)

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini%202.0%20Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![Express](https://img.shields.io/badge/Express.js-4+-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)

**Get Hired Faster with AI Intelligence**

_Upload your resume → Get AI Score → Fix gaps → Apply smarter_

[🚀 Features](#-features) • [🛠️ Tech Stack](#️-tech-stack) • [📦 Installation](#-installation) • [🔌 API Docs](#-api-documentation) • [🗺️ Project Flow](#️-project-flow)

</div>

---

## 📸 Screenshots

<div align="center">
 
### 🏠 Landing Page
![Landing Page](./assets/landing.png)

</div>

---

## 📌 What is HireBot?

HireBot is a production-ready, full-stack AI-powered hiring SaaS platform that solves real problems on both sides of the hiring process simultaneously.

| 👤 For Job Seekers                                                                                                                                                                                        | 🏢 For Recruiters                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Over 75% of resumes are rejected by ATS software before a human reads them. Job seekers get no feedback, no scores, and no guidance.                                                                      | Manually screening hundreds of applications to find the best candidate is slow, inconsistent, and biased.                                                                               |
| **HireBot Solution:** Analyze your resume against any job description. Score it across 5 dimensions. Detect skill gaps. Rewrite bullet points. Generate a complete interview prep kit with model answers. | **HireBot Solution:** The moment a job seeker applies, Gemini AI automatically scores them. Recruiters see a ranked leaderboard sorted by match score — best candidate is always first. |

---

## ✨ Features

### 👤 For Job Seekers

| Feature                      | Description                                                                                                                                   |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 📊 **Resume Score**          | AI scores your resume out of 100 across 5 dimensions: overall fit, ATS compatibility, skills match, experience alignment, and keyword density |
| 🎯 **JD Matching**           | Compare your resume against any job description and get a detailed match analysis                                                             |
| 🔍 **Skill Gap Detection**   | See exactly which skills you're missing with priority levels and suggested learning paths                                                     |
| 💡 **AI Suggestions**        | Get a prioritized action plan with specific, actionable improvement tips                                                                      |
| ✏️ **Bullet Point Rewriter** | AI rewrites weak resume bullet points with metrics and strong action verbs                                                                    |
| 📄 **ATS Optimizer**         | Check your ATS compatibility score and see missing keywords from the job description                                                          |
| 📥 **PDF Generator**         | Download an AI-optimized, tailored resume as a PDF file                                                                                       |
| 🎤 **Interview Prep**        | Get 5 technical + 5 behavioral interview questions with full model answers and a week-by-week preparation plan                                |
| 📋 **Application Tracker**   | Track all your job applications and their statuses in one place                                                                               |
| 🔔 **In-App Notifications**  | Real-time bell notifications for application updates, shortlisting, and interview invites                                                     |

### 🏢 For Recruiters

| Feature                            | Description                                                                                  |
| ---------------------------------- | -------------------------------------------------------------------------------------------- |
| 📝 **Post Jobs**                   | Create and manage job listings with full control                                             |
| 🤖 **AI Job Enhancer**             | AI rewrites and improves your raw job description into a professional, ATS-optimized listing |
| 🏆 **AI Candidate Ranking**        | All applicants are automatically scored and ranked by AI match score — best fit is always #1 |
| 📊 **Dashboard Stats**             | View total applicants, shortlisted count, active jobs, and average match score at a glance   |
| ✅ **Shortlist / Reject / Invite** | Manage candidates with one click — triggers automatic email and in-app notifications         |
| 💬 **AI Candidate Summary**        | Per-candidate breakdown of strengths, weaknesses, and missing skills generated by Gemini     |

### 💳 SaaS & Platform Features _(v2.0)_

| Feature                       | Description                                                                            |
| ----------------------------- | -------------------------------------------------------------------------------------- |
| 💳 **Razorpay Payments**      | Real payment processing with HMAC-SHA256 signature verification and webhook support    |
| 📧 **Email Notifications**    | 5 automated HTML email templates triggered on key platform events via Nodemailer       |
| 🔔 **Notification System**    | MongoDB-backed in-app notifications with 30-day auto-delete TTL — no cron jobs needed  |
| 🔒 **Plan Limit Enforcement** | Server-side usage limits enforced by middleware — cannot be bypassed from the frontend |
| 🆙 **Upgrade Modal**          | Automatically shown when a free user hits their plan limit                             |

---

## 💳 Subscription Plans

| Feature                  | Free Plan      | Pro Plan                      |
| ------------------------ | -------------- | ----------------------------- |
| Resume Analyses          | Limited month  | Unlimited                     |
| Interview Reports        | Limited        | Unlimited                     |
| Job Applications         | Unlimited      | Unlimited                     |
| AI Candidate Ranking     | ✅ Included    | ✅ Included                   |
| Priority AI Processing   | ❌             | ✅                            |
| Advanced Hiring Insights | ❌             | ✅                            |
| PDF Exports              | ✅ Included    | ✅ Included                   |
| **Price**                | **₹0 forever** | **₹499/month or ₹3,999/year** |

---

## 🛠️ Tech Stack

### Backend

```
Node.js 18+          → Server runtime
Express.js 4+        → REST API framework
MongoDB Atlas        → Cloud database (7 collections)
Mongoose             → ODM — schema validation & query building
JWT (HTTP-only)      → Stateless, XSS-resistant authentication
bcryptjs             → Password hashing (10 salt rounds)
Multer               → PDF file upload (memoryStorage, 3 MB limit)
pdf-parse-new        → Extract text from PDF buffer
Puppeteer            → Headless Chrome — render HTML to PDF
Razorpay             → Payment gateway (HMAC-SHA256 verified)
Nodemailer           → Email delivery via Gmail SMTP
```

### AI Layer

```
Google Gemini 2.5 Flash-Lite   → Core AI model (all 6 AI features)
@google/genai                  → Official Google AI SDK
Zod + zod-to-json-schema       → Schema enforcement for structured AI output
Two-Step AI Pipeline           → Solves silent token-limit truncation
```

### Frontend

```
React 18             → UI framework
React Router v7      → Client-side routing with role-based protection
Axios                → HTTP client (withCredentials for cookies)
SCSS                 → Dark theme, feature-scoped stylesheets
Vite                 → Build tool with fast HMR
Framer Motion        → Page transitions and micro-interactions
Razorpay Checkout JS → Dynamically loaded payment popup
```

---

## 📁 Project Structure

```
HireBot/
├── 📂 Backend/
│   └── src/
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── resume.controller.js
│       │   ├── job.controller.js
│       │   ├── application.controller.js
│       │   ├── interview.controller.js
│       │   ├── notification.controller.js   ← v2.0
│       │   └── payment.controller.js        ← v2.0
│       ├── middlewares/
│       │   ├── auth.middleware.js
│       │   ├── role.middleware.js
│       │   ├── file.middleware.js
│       │   ├── checkPlanLimit.middleware.js ← v2.0
│       │   └── requirePlan.middleware.js    ← v2.0
│       ├── models/
│       │   ├── user.model.js               ← updated: plan + usage fields
│       │   ├── resume.model.js
│       │   ├── job.model.js
│       │   ├── application.model.js
│       │   ├── interviewReport.model.js
│       │   ├── blacklistToken.model.js
│       │   └── notification.model.js       ← v2.0
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── resume.routes.js
│       │   ├── job.routes.js
│       │   ├── application.routes.js
│       │   ├── interview.routes.js
│       │   ├── notification.routes.js      ← v2.0
│       │   └── payment.routes.js           ← v2.0
│       ├── services/
│       │   ├── ai.service.js
│       │   └── email.service.js            ← v2.0
│       └── app.js
│
└── 📂 Frontend/
    └── src/
        ├── features/
        │   ├── landing/       → HirebotLanding.jsx (with Pricing Preview)
        │   ├── auth/          → Login, Register, Protected route
        │   ├── dashboard/     → Dashboard, Settings
        │   ├── resume/        → ResumeAnalyzer
        │   ├── jobs/          → Jobs listing & search
        │   ├── interview/     → InterviewPrep, InterviewHistory
        │   ├── applications/  → ApplicationTracker
        │   ├── recruiter/     → RecruiterDashboard, PostJobForm, ApplicantsRanking
        │   ├── notifications/ → NotificationBell          ← v2.0
        │   └── payments/      → PricingPage               ← v2.0
        └── shared/
            ├── Sidebar.jsx
            ├── NotificationBell.jsx                        ← v2.0
            ├── UpgradeModal.jsx                            ← v2.0
            ├── PlanBadge.jsx                               ← v2.0
            └── usePlanLimit.jsx (hook)                     ← v2.0
```

---

## 📦 Installation

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)
- Google AI Studio account (Gemini API key)
- Razorpay account (for payment features)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/parthkhanna121000/hirebot.git
cd hirebot
```

---

### 2️⃣ Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend/` folder:

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hirebot

# JWT
JWT_SECRET=your_strong_64_char_random_string

# Google Gemini
GOOGLE_GENAI_API_KEY_1=your_primary_gemini_key
GOOGLE_GENAI_API_KEY_2=your_backup_gemini_key

# Razorpay
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=hirebot_webhook_secret_2026

# SMTP (Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx

# App
FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173
NODE_ENV=development
PORT=3000
```

Start the backend:

```bash
node server.js
```

You should see:

```
MongoDB Connected
Server is running on port 3000
```

---

### 3️⃣ Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

Open → **http://localhost:5173**

---

## 🔑 Getting API Keys

### MongoDB URI

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) and create a free cluster
2. Click **Connect** → **Drivers**
3. Copy the connection string and replace `<password>` with your DB password

### Google Gemini API Key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click **Get API Key** → Create new key
3. Paste it into `.env` as `GOOGLE_GENAI_API_KEY_1`
   > ⚠️ Free tier has daily quota limits. If you hit the limit, wait 24 hours or upgrade (~$0.075 per 1M tokens).

### Razorpay Keys

1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com) and create an account
2. Navigate to **Settings** → **API Keys** → Generate test keys
3. Copy `Key ID` and `Key Secret` into `.env`

### Gmail App Password (for email notifications)

1. Enable 2-factor authentication on your Google account
2. Go to **Google Account** → **Security** → **App Passwords**
3. Generate a 16-character password and paste it as `SMTP_PASS`

---

## 🔌 API Documentation

### 🔐 Auth — 6 Endpoints

| Method | Route                       | Access  | Description                              |
| ------ | --------------------------- | ------- | ---------------------------------------- |
| POST   | `/api/auth/register`        | Public  | Register as jobseeker or recruiter       |
| POST   | `/api/auth/login`           | Public  | Login — issues JWT in HTTP-only cookie   |
| GET    | `/api/auth/logout`          | Public  | Blacklist token + clear cookie           |
| GET    | `/api/auth/me`              | Private | Get current user profile                 |
| PUT    | `/api/auth/profile`         | Private | Update profile fields                    |
| PUT    | `/api/auth/change-password` | Private | Change password with bcrypt verification |

### 📄 Resume — 6 Endpoints

| Method | Route                          | Access    | Description                         |
| ------ | ------------------------------ | --------- | ----------------------------------- |
| POST   | `/api/resume/analyze`          | Jobseeker | PDF + JD → 23-field AI analysis     |
| GET    | `/api/resume`                  | Jobseeker | All analyses for current user       |
| GET    | `/api/resume/:id`              | Jobseeker | Single analysis by ID               |
| DELETE | `/api/resume/:id`              | Jobseeker | Delete analysis                     |
| POST   | `/api/resume/rewrite-bullet`   | Jobseeker | AI rewrite one bullet point         |
| POST   | `/api/resume/generate-pdf/:id` | Jobseeker | Download AI-optimized resume as PDF |

### 🎤 Interview — 5 Endpoints

| Method | Route                           | Access  | Description                            |
| ------ | ------------------------------- | ------- | -------------------------------------- |
| POST   | `/api/interview`                | Private | Generate report via 2-step AI pipeline |
| GET    | `/api/interview`                | Private | All interview reports (history)        |
| GET    | `/api/interview/report/:id`     | Private | Single report by ID                    |
| DELETE | `/api/interview/report/:id`     | Private | Delete report                          |
| POST   | `/api/interview/resume/pdf/:id` | Private | Generate PDF from interview report     |

### 💼 Jobs — 8 Endpoints

| Method | Route                         | Access    | Description                                          |
| ------ | ----------------------------- | --------- | ---------------------------------------------------- |
| GET    | `/api/jobs`                   | Public    | All active listings with search, filter & pagination |
| GET    | `/api/jobs/:id`               | Public    | Single job details                                   |
| GET    | `/api/jobs/recommended`       | Jobseeker | AI-matched job recommendations                       |
| POST   | `/api/jobs`                   | Recruiter | Create new job listing                               |
| POST   | `/api/jobs/enhance`           | Recruiter | AI-enhance job description via Gemini                |
| PUT    | `/api/jobs/:id`               | Recruiter | Update listing                                       |
| DELETE | `/api/jobs/:id`               | Recruiter | Delete listing                                       |
| GET    | `/api/jobs/recruiter/my-jobs` | Recruiter | All jobs posted by current recruiter                 |

### 📋 Applications — 6 Endpoints

| Method | Route                               | Access    | Description                                    |
| ------ | ----------------------------------- | --------- | ---------------------------------------------- |
| POST   | `/api/applications/apply/:jobId`    | Jobseeker | Upload PDF → AI scores → creates application   |
| GET    | `/api/applications/my`              | Jobseeker | All applications for current user              |
| GET    | `/api/applications/my/:id`          | Jobseeker | Single application with full AI breakdown      |
| GET    | `/api/applications/job/:jobId`      | Recruiter | All applicants sorted by AI match score        |
| PUT    | `/api/applications/:id/status`      | Recruiter | Update status → triggers email + notification  |
| GET    | `/api/applications/recruiter/stats` | Recruiter | Aggregate stats: total, shortlisted, avg score |

### 💳 Payments — 4 Endpoints _(v2.0)_

| Method | Route                        | Access                | Description                                            |
| ------ | ---------------------------- | --------------------- | ------------------------------------------------------ |
| POST   | `/api/payments/create-order` | Private               | Create Razorpay order — returns orderId, amount, keyId |
| POST   | `/api/payments/verify`       | Private               | Verify HMAC-SHA256 signature → upgrade to Pro          |
| POST   | `/api/payments/webhook`      | Public (sig-verified) | Razorpay webhook — parallel upgrade path               |
| GET    | `/api/payments/status`       | Private               | Current plan, usage counters, expiry date              |

### 🔔 Notifications — 5 Endpoints _(v2.0)_

| Method | Route                         | Access  | Description                           |
| ------ | ----------------------------- | ------- | ------------------------------------- |
| GET    | `/api/notifications`          | Private | All notifications + unread count      |
| POST   | `/api/notifications/create`   | Private | Create notification (used internally) |
| PATCH  | `/api/notifications/:id/read` | Private | Mark single notification as read      |
| PATCH  | `/api/notifications/read-all` | Private | Mark all notifications as read        |
| DELETE | `/api/notifications/:id`      | Private | Delete a single notification          |

---

## 🗄️ Database Models

| Model               | Key Fields                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **User**            | `username`, `email`, `password_hash`, `role`, `plan`, `planExpiryDate`, `usage{resumeAnalyses, interviewReports}`               |
| **Resume**          | 23 AI fields: `overallScore`, `atsScore`, `skillsMatch`, `skillGapIntelligence[]`, `bulletRewrites[]`, `actionPlan[]`, and more |
| **InterviewReport** | `matchScore`, `technicalQuestions[]`, `behavioralQuestions[]`, `skillGaps[]`, `preparationPlan[]`                               |
| **Job**             | `title`, `description`, `requiredSkills[]`, `isActive`, `postedBy` — full-text search index                                     |
| **Application**     | `matchScore`, `status`, `aiSummary`, `strengths[]`, `missingSkills[]`, `recruiterNote`                                          |
| **BlacklistToken**  | `token`, `createdAt` — TTL auto-deletes after 7 days                                                                            |
| **Notification**    | `userId`, `type`, `title`, `message`, `isRead` — TTL auto-deletes after 30 days                                                 |

---

## 🔒 Security Architecture

| Layer                | Implementation                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| Password Hashing     | bcryptjs with 10 salt rounds — plaintext never stored                                                |
| Authentication       | JWT stored in HTTP-only cookies — JavaScript cannot access via `document.cookie`                     |
| Token Revocation     | `BlacklistToken` collection — stolen tokens invalidated immediately on logout                        |
| Role Guards          | `requireRole()` middleware on all protected backend routes                                           |
| Frontend Protection  | `Protected` component with role-aware redirect via `ROLE_HOME` map                                   |
| Cookie Flags         | `httpOnly: true`, `secure: true`, `sameSite: 'strict'` — CSRF resistant                              |
| File Upload Security | Multer validates PDF MIME type, 3 MB limit, `memoryStorage` — files never touch disk                 |
| CORS                 | Specific `FRONTEND_URL` origin only, `credentials: true` — first middleware registered               |
| AI Output Validation | Zod schemas on Gemini `responseSchema` — prevents schema drift and malformed output                  |
| Payment Verification | HMAC-SHA256 signature verified server-side on every payment and webhook event                        |
| Plan Enforcement     | `checkPlanLimit` middleware blocks excess usage at API level — bypassing from frontend is impossible |

---

## 🗺️ Project Flow

```
User visits HireBot
        ↓
  Landing Page → Register / Login
        ↓
    ┌───────────────┴───────────────┐
    ▼                               ▼
 Job Seeker                     Recruiter
    ↓                               ↓
 Upload Resume                  Post Job
 (PDF → AI Analysis)            (AI Enhanced JD)
    ↓                               ↓
 Get Score, Gaps,               Candidates
 Bullet Rewrites,               Auto-Ranked
 Interview Prep                 by AI Score
    ↓                               ↓
 Apply to Jobs               Shortlist / Invite
    ↓                               ↓
 Track Status              Email + Notification
    ↓                         Sent Automatically
 Free → Hit Limit?
    ↓
 Upgrade to Pro
 via Razorpay
```

---

## ⚙️ Critical app.js Middleware Order

The order of middleware in `app.js` is security-critical. Incorrect ordering caused Bug #17 (CORS failure) in development.

```
1. cors()                          ← MUST be first — before all routes
2. /api/payments/webhook  raw()    ← MUST be before express.json()
3. express.json()
4. express.urlencoded()
5. cookieParser()
6. Route registrations
```

---

## 🚀 Deployment

### Backend — Render

| Setting       | Value                                                                                  |
| ------------- | -------------------------------------------------------------------------------------- |
| Subfolder     | `Backend/`                                                                             |
| Build command | `npm install`                                                                          |
| Start command | `node server.js`                                                                       |
| CRITICAL NOTE | Add Puppeteer buildpack on Render, or switch to `puppeteer-core` + `chrome-aws-lambda` |

### Frontend — Vercel

| Setting        | Value                                                                   |
| -------------- | ----------------------------------------------------------------------- |
| Subfolder      | `Frontend/`                                                             |
| Framework      | Vite                                                                    |
| `VITE_API_URL` | Your Render backend URL                                                 |
| `vercel.json`  | `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }` |

> Before deploying frontend, update all Axios `baseURL` references to `import.meta.env.VITE_API_URL`.

---

## ⚠️ Known Issues

| Issue                  | Status   | Notes                                                           |
| ---------------------- | -------- | --------------------------------------------------------------- |
| Gemini API quota limit | ⚠️ Known | Free tier has daily limits. Upgrade to paid for production use. |
| Puppeteer on Linux     | ⚠️ Known | May need `--no-sandbox` flag or Puppeteer buildpack on Render.  |
| Scanned PDF support    | ⚠️ Known | Only works with text-based PDFs — not scanned images.           |

---

## 📊 Project Stats

| Metric                  | Count                    |
| ----------------------- | ------------------------ |
| REST API Endpoints      | 35                       |
| Database Models         | 7                        |
| AI Features             | 6                        |
| Frontend Pages          | 14                       |
| Bugs Identified & Fixed | 20                       |
| Overall Completion      | 99% (Deployment Pending) |

---

## 👨‍💻 Author

**Parth Khanna** — B.Tech Computer Science Engineering, Final Semester

- GitHub: [parthkhanna121000](https://github.com/parthkhanna121000)
- LinkedIn: [parth-khanna-17a380278](https://www.linkedin.com/in/parth-khanna-17a380278/)

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
**Built with ❤️ using React, Node.js, MongoDB, Google Gemini AI & Razorpay**
 
⭐ Star this repo if you found it helpful!
 
</div>
