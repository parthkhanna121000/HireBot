const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const interviewController = require("../controllers/interview.controller");
const upload = require("../middlewares/file.middleware");
const { checkPlanLimit } = require("../middlewares/checkPlanLimit.middleware"); // ← NEW

const interviewRouter = express.Router();

// Generate new report — plan limit enforced before controller runs
interviewRouter.post(
  "/",
  authMiddleware.authUser,
  upload.single("resume"),
  checkPlanLimit("interviewReports"), // ← NEW: 1/day on free plan
  interviewController.generateInterViewReportController,
);

// Get all reports (for history page)
interviewRouter.get(
  "/",
  authMiddleware.authUser,
  interviewController.getAllInterviewReportsController,
);

// Get single report by ID
interviewRouter.get(
  "/report/:interviewId",
  authMiddleware.authUser,
  interviewController.getInterviewReportByIdController,
);

// Delete a report (for history management)
interviewRouter.delete(
  "/report/:interviewId",
  authMiddleware.authUser,
  interviewController.deleteInterviewReportController,
);

// Generate resume PDF from report
interviewRouter.post(
  "/resume/pdf/:interviewReportId",
  authMiddleware.authUser,
  interviewController.generateResumePdfController,
);

module.exports = interviewRouter;
