const { Router } = require("express");
const jobController = require("../controllers/job.controller");
const { authUser } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

const jobRouter = Router();

/** @route GET /api/jobs — Public — browse all jobs with filters */
jobRouter.get("/", jobController.getAllJobsController);

/** @route GET /api/jobs/recommended — Private (jobseeker) — AI job recommendations */
jobRouter.get(
  "/recommended",
  authUser,
  requireRole("jobseeker"),
  jobController.getRecommendedJobsController,
);

/** @route GET /api/jobs/recruiter/my-jobs — Private (recruiter) — get own posted jobs */
jobRouter.get(
  "/recruiter/my-jobs",
  authUser,
  requireRole("recruiter"),
  jobController.getMyJobsController,
);

/** @route POST /api/jobs/enhance — Private (recruiter) — AI enhance JD before posting */
jobRouter.post(
  "/enhance",
  authUser,
  requireRole("recruiter"),
  jobController.enhanceJobController,
);

/** @route POST /api/jobs — Private (recruiter) — post new job */
jobRouter.post(
  "/",
  authUser,
  requireRole("recruiter"),
  jobController.createJobController,
);

/** @route GET /api/jobs/:jobId — Public — get single job */
jobRouter.get("/:jobId", jobController.getJobByIdController);

/** @route PUT /api/jobs/:jobId — Private (recruiter) — update job */
jobRouter.put(
  "/:jobId",
  authUser,
  requireRole("recruiter"),
  jobController.updateJobController,
);

/** @route DELETE /api/jobs/:jobId — Private (recruiter) — delete job */
jobRouter.delete(
  "/:jobId",
  authUser,
  requireRole("recruiter"),
  jobController.deleteJobController,
);

module.exports = jobRouter;
