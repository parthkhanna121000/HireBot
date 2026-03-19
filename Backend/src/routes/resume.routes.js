const { Router } = require("express");
const resumeController = require("../controllers/resume.controller");
const { authUser, requireRole } = require("../middlewares/auth.middleware"); // ✅
const upload = require("../middlewares/file.middleware");

const resumeRouter = Router();

// All resume routes require login + jobseeker role
resumeRouter.use(authUser, requireRole("jobseeker"));

/** @route POST /api/resume/analyze — upload PDF + JD → AI analysis */
resumeRouter.post(
  "/analyze",
  upload.single("resume"),
  resumeController.analyzeResumeController,
);

/** @route GET /api/resume — get all resume analyses */
resumeRouter.get("/", resumeController.getAllResumesController);

/** @route GET /api/resume/:resumeId — get single analysis */
resumeRouter.get("/:resumeId", resumeController.getResumeByIdController);

/** @route DELETE /api/resume/:resumeId — delete analysis */
resumeRouter.delete("/:resumeId", resumeController.deleteResumeController);

/** @route POST /api/resume/rewrite-bullet — AI bullet rewrite */
resumeRouter.post("/rewrite-bullet", resumeController.rewriteBulletController);

/** @route POST /api/resume/generate-pdf/:resumeId — download optimized PDF */
resumeRouter.post(
  "/generate-pdf/:resumeId",
  resumeController.generateResumePdfController,
);

module.exports = resumeRouter;
