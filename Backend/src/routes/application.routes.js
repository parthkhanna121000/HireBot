const { Router } = require("express");
const applicationController = require("../controllers/application.controller");
const { authUser } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

const applicationRouter = Router();

// ── Job Seeker Routes ─────────────────────────────────────────────────────────

/** @route POST /api/applications/apply/:jobId — apply to a job */
applicationRouter.post(
  "/apply/:jobId",
  authUser,
  requireRole("jobseeker"),
  applicationController.applyToJobController,
);

/** @route GET /api/applications/my — get all my applications */
applicationRouter.get(
  "/my",
  authUser,
  requireRole("jobseeker"),
  applicationController.getMyApplicationsController,
);

/** @route GET /api/applications/my/:applicationId — get single application */
applicationRouter.get(
  "/my/:applicationId",
  authUser,
  requireRole("jobseeker"),
  applicationController.getMyApplicationByIdController,
);

// ── Recruiter Routes ──────────────────────────────────────────────────────────

/** @route GET /api/applications/recruiter/stats — recruiter dashboard stats */
applicationRouter.get(
  "/recruiter/stats",
  authUser,
  requireRole("recruiter"),
  applicationController.getRecruiterStatsController,
);

/** @route GET /api/applications/job/:jobId — get all applicants for a job (AI ranked) */
applicationRouter.get(
  "/job/:jobId",
  authUser,
  requireRole("recruiter"),
  applicationController.getJobApplicantsController,
);

/** @route PUT /api/applications/:applicationId/status — shortlist / reject / hire */
applicationRouter.put(
  "/:applicationId/status",
  authUser,
  requireRole("recruiter"),
  applicationController.updateApplicationStatusController,
);

module.exports = applicationRouter;
