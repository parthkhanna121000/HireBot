// const { Router } = require("express");
// const applicationController = require("../controllers/application.controller");
// const { authUser } = require("../middlewares/auth.middleware");
// const { requireRole } = require("../middlewares/role.middleware");

// const applicationRouter = Router();

// // ── Job Seeker Routes ─────────────────────────────────────────────────────────

// /** @route POST /api/applications/apply/:jobId — apply to a job */
// applicationRouter.post(
//   "/apply/:jobId",
//   authUser,
//   requireRole("jobseeker"),
//   applicationController.applyToJobController,
// );

// /** @route GET /api/applications/my — get all my applications */
// applicationRouter.get(
//   "/my",
//   authUser,
//   requireRole("jobseeker"),
//   applicationController.getMyApplicationsController,
// );

// /** @route GET /api/applications/my/:applicationId — get single application */
// applicationRouter.get(
//   "/my/:applicationId",
//   authUser,
//   requireRole("jobseeker"),
//   applicationController.getMyApplicationByIdController,
// );

// // ── Recruiter Routes ──────────────────────────────────────────────────────────

// /** @route GET /api/applications/recruiter/stats — recruiter dashboard stats */
// applicationRouter.get(
//   "/recruiter/stats",
//   authUser,
//   requireRole("recruiter"),
//   applicationController.getRecruiterStatsController,
// );

// /** @route GET /api/applications/job/:jobId — get all applicants for a job (AI ranked) */
// applicationRouter.get(
//   "/job/:jobId",
//   authUser,
//   requireRole("recruiter"),
//   applicationController.getJobApplicantsController,
// );

// /** @route PUT /api/applications/:applicationId/status — shortlist / reject / hire */
// applicationRouter.put(
//   "/:applicationId/status",
//   authUser,
//   requireRole("recruiter"),
//   applicationController.updateApplicationStatusController,
// );

// module.exports = applicationRouter;

const { Router } = require("express");
const multer = require("multer");
const appController = require("../controllers/application.controller");
const { authUser } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

// ── Multer — memory storage, PDF only, 3 MB max ───────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") return cb(null, true);
    cb(new Error("Only PDF files are accepted."), false);
  },
});

const applicationRouter = Router();

// ── Recruiter stats — MUST come before /:id routes to avoid param conflict ──
applicationRouter.get(
  "/recruiter/stats",
  authUser,
  requireRole("recruiter"),
  appController.getRecruiterStatsController,
);

// ── Jobseeker routes ──────────────────────────────────────────────────────────

/**
 * POST /api/applications/apply/:jobId
 * multipart/form-data — field name: "resume" (PDF)
 * Multer parses the file into req.file BEFORE the controller runs.
 */
applicationRouter.post(
  "/apply/:jobId",
  authUser,
  requireRole("jobseeker"),
  upload.single("resume"), // ← puts PDF buffer at req.file
  appController.applyToJobController,
);

applicationRouter.get(
  "/my",
  authUser,
  requireRole("jobseeker"),
  appController.getMyApplicationsController,
);

applicationRouter.get(
  "/my/:id",
  authUser,
  requireRole("jobseeker"),
  appController.getSingleApplicationController,
);

// ── Recruiter routes ──────────────────────────────────────────────────────────

applicationRouter.get(
  "/job/:jobId",
  authUser,
  requireRole("recruiter"),
  appController.getJobApplicantsController,
);

applicationRouter.put(
  "/:id/status",
  authUser,
  requireRole("recruiter"),
  appController.updateApplicationStatusController,
);

module.exports = applicationRouter;
