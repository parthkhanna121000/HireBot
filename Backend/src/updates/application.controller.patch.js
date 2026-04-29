/**
 * APPLICATION CONTROLLER PATCH
 *
 * Add email + notification triggers to your existing application.controller.js.
 *
 * IMPORTS TO ADD at the top of application.controller.js:
 */

import {
  sendApplicationEmail,
  sendShortlistEmail,
  sendRejectionEmail,
  sendInterviewInviteEmail,
} from "../services/email.service.js";

import { pushNotification } from "../controllers/notification.controller.js";
import User from "../models/user.model.js";
import Job from "../models/job.model.js";

// ─── PATCH 1: In your `applyToJob` controller ─────────────────────────────────
// After saving the application to MongoDB, add:

const applyToJobPatch = async (req, res) => {
  // ... your existing apply logic ...

  // ADD AFTER application is saved:
  const [applicant, job] = await Promise.all([
    User.findById(application.applicant).select("email username"),
    Job.findById(application.job).select("title companyName"),
  ]);

  // Email + notification (non-blocking)
  Promise.allSettled([
    sendApplicationEmail({
      to: applicant.email,
      name: applicant.username,
      jobTitle: job.title,
      companyName: job.companyName,
    }),
    pushNotification({
      userId: applicant._id,
      type: "application",
      title: "Application Submitted",
      message: `Your application for ${job.title} has been received.`,
      link: "/applications",
    }),
  ]);

  res.status(201).json({ application, matchScore: application.matchScore });
};

// ─── PATCH 2: In your `updateApplicationStatus` controller ────────────────────
// Replace or extend the existing status-update logic:

export const updateApplicationStatus = async (req, res) => {
  try {
    const {
      status,
      recruiterNote,
      interviewDate,
      interviewTime,
      interviewInstructions,
    } = req.body;

    const application = await applicationModel
      .findByIdAndUpdate(
        req.params.id,
        { status, recruiterNote },
        { new: true },
      )
      .populate("applicant", "email username")
      .populate("job", "title companyName");

    if (!application)
      return res.status(404).json({ message: "Application not found" });

    const { applicant, job } = application;

    // Trigger email + notification based on new status
    if (status === "shortlisted") {
      Promise.allSettled([
        sendShortlistEmail({
          to: applicant.email,
          name: applicant.username,
          jobTitle: job.title,
          companyName: job.companyName,
          recruiterNote,
        }),
        pushNotification({
          userId: applicant._id,
          type: "application",
          title: "You've Been Shortlisted 🎉",
          message: `Great news! You've been shortlisted for ${job.title}.`,
          link: "/applications",
          meta: { applicationId: application._id },
        }),
      ]);
    }

    if (status === "rejected") {
      Promise.allSettled([
        sendRejectionEmail({
          to: applicant.email,
          name: applicant.username,
          jobTitle: job.title,
          companyName: job.companyName,
          recruiterNote,
        }),
        pushNotification({
          userId: applicant._id,
          type: "application",
          title: "Application Update",
          message: `Update on your ${job.title} application.`,
          link: "/applications",
          meta: { applicationId: application._id },
        }),
      ]);
    }

    if (status === "interview") {
      Promise.allSettled([
        sendInterviewInviteEmail({
          to: applicant.email,
          name: applicant.username,
          jobTitle: job.title,
          companyName: job.companyName,
          date: interviewDate,
          time: interviewTime,
          instructions: interviewInstructions,
        }),
        pushNotification({
          userId: applicant._id,
          type: "interview",
          title: "Interview Invitation 📅",
          message: `You've been invited to interview for ${job.title}${interviewDate ? ` on ${interviewDate}` : ""}.`,
          link: "/applications",
          meta: {
            applicationId: application._id,
            interviewDate,
            interviewTime,
          },
        }),
      ]);
    }

    res.json({ application });
  } catch (err) {
    console.error("[application] updateStatus:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

// ─── PATCH 3: SERVER.JS additions ─────────────────────────────────────────────
/*
ADD these imports and route mounts to your server.js:

import paymentRoutes      from "./routes/payment.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

// ⚠️ Mount payment BEFORE express.json() — webhook needs raw body
app.use("/api/payments",      paymentRoutes);

// After express.json():
app.use(express.json());
app.use("/api/notifications", notificationRoutes);
*/

// ─── PATCH 4: resume.controller.js — Add checkPlanLimit + incrementUsage ─────
/*
In resume.routes.js:
  import { checkPlanLimit } from "../middlewares/checkPlanLimit.middleware.js";
  router.post("/analyze", authMiddleware, requireRole("jobseeker"), checkPlanLimit("resumeAnalyses"), analyzeResume);

In resume.controller.js analyzeResume, after successfully saving:
  import { incrementUsage } from "../middlewares/checkPlanLimit.middleware.js";
  await incrementUsage(req.user.id, "resumeAnalyses");
*/

// ─── PATCH 5: interview.controller.js — Add checkPlanLimit + incrementUsage ──
/*
In interview.routes.js:
  import { checkPlanLimit } from "../middlewares/checkPlanLimit.middleware.js";
  router.post("/", authMiddleware, checkPlanLimit("interviewReports"), generateInterviewReport);

In interview.controller.js, after successfully saving:
  import { incrementUsage } from "../middlewares/checkPlanLimit.middleware.js";
  await incrementUsage(req.user.id, "interviewReports");
  
  // Also push a notification:
  pushNotification({
    userId:  req.user.id,
    type:    "interview",
    title:   "Interview Report Ready",
    message: `Your interview prep report for ${jobTitle} is ready.`,
    link:    `/interview-prep?reportId=${report._id}`,
  });
*/
