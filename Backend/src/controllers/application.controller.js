const applicationModel = require("../models/application.model");
const jobModel = require("../models/job.model");
const resumeModel = require("../models/resume.model");
const { rankCandidate } = require("../services/ai.service");

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @route   POST /api/applications/apply/:jobId
 * @desc    Job seeker applies to a job using one of their resume analyses
 * @access  Private (jobseeker)
 */
async function applyToJobController(req, res) {
  try {
    const { jobId } = req.params;
    const { resumeId } = req.body;

    if (!resumeId) {
      return res
        .status(400)
        .json({ message: "Please provide a resumeId to apply with" });
    }

    // Verify job exists
    const job = await jobModel.findById(jobId);
    if (!job || !job.isActive) {
      return res
        .status(404)
        .json({ message: "Job not found or no longer active" });
    }

    // Verify resume belongs to user
    const resume = await resumeModel.findOne({
      _id: resumeId,
      user: req.user.id,
    });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // Check duplicate application
    const alreadyApplied = await applicationModel.findOne({
      job: jobId,
      applicant: req.user.id,
    });
    if (alreadyApplied) {
      return res
        .status(400)
        .json({ message: "You have already applied to this job" });
    }

    // AI ranking — score this candidate against the job
    const ranking = await rankCandidate({
      resume: resume.originalText,
      jobDescription: job.description,
      jobTitle: job.title,
      requiredSkills: job.requiredSkills,
    });

    // Create application with AI data
    const application = await applicationModel.create({
      job: jobId,
      applicant: req.user.id,
      resume: resumeId,
      matchScore: ranking.matchScore,
      skillsMatch: ranking.skillsMatch,
      experienceMatch: ranking.experienceMatch,
      keywordsMatch: ranking.keywordsMatch,
      aiSummary: ranking.aiSummary,
      strengths: ranking.strengths,
      weaknesses: ranking.weaknesses,
      missingSkills: ranking.missingSkills,
    });

    return res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "You have already applied to this job" });
    }
    console.error("ApplyToJob error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   GET /api/applications/my
 * @desc    Job seeker gets all their applications with status
 * @access  Private (jobseeker)
 */
async function getMyApplicationsController(req, res) {
  try {
    const applications = await applicationModel
      .find({ applicant: req.user.id })
      .populate("job", "title companyName location jobType salaryMin salaryMax")
      .populate("resume", "overallScore atsScore jobRoleUsed")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Applications fetched successfully",
      applications,
    });
  } catch (error) {
    console.error("GetMyApplications error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   GET /api/applications/my/:applicationId
 * @desc    Job seeker gets a single application with full AI feedback
 * @access  Private (jobseeker)
 */
async function getMyApplicationByIdController(req, res) {
  try {
    const application = await applicationModel
      .findOne({ _id: req.params.applicationId, applicant: req.user.id })
      .populate("job")
      .populate("resume");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    return res.status(200).json({
      message: "Application fetched successfully",
      application,
    });
  } catch (error) {
    console.error("GetMyApplicationById error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   GET /api/applications/job/:jobId
 * @desc    Recruiter gets all applicants for a job — AI ranked
 * @access  Private (recruiter)
 */
async function getJobApplicantsController(req, res) {
  try {
    const { jobId } = req.params;

    // Verify this job belongs to the recruiter
    const job = await jobModel.findOne({ _id: jobId, postedBy: req.user.id });
    if (!job) {
      return res.status(404).json({ message: "Job not found or unauthorized" });
    }

    const applications = await applicationModel
      .find({ job: jobId })
      .populate("applicant", "username email skills experienceLevel")
      .populate("resume", "overallScore atsScore skillsMatch fileName")
      .sort({ matchScore: -1 }); // highest match first

    return res.status(200).json({
      message: "Applicants fetched successfully",
      total: applications.length,
      applications,
    });
  } catch (error) {
    console.error("GetJobApplicants error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   PUT /api/applications/:applicationId/status
 * @desc    Recruiter updates application status (shortlist / reject / hire)
 * @access  Private (recruiter)
 */
async function updateApplicationStatusController(req, res) {
  try {
    const { status, recruiterNote, rejectionFeedback, improvementTips } =
      req.body;

    const validStatuses = ["applied", "shortlisted", "rejected", "hired"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Find application and verify recruiter owns the job
    const application = await applicationModel
      .findById(req.params.applicationId)
      .populate("job");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    application.status = status;
    if (recruiterNote) application.recruiterNote = recruiterNote;
    if (rejectionFeedback) application.rejectionFeedback = rejectionFeedback;
    if (improvementTips) application.improvementTips = improvementTips;

    await application.save();

    return res.status(200).json({
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    console.error("UpdateApplicationStatus error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   GET /api/applications/recruiter/stats
 * @desc    Recruiter dashboard stats — total applicants, shortlisted, active jobs
 * @access  Private (recruiter)
 */
async function getRecruiterStatsController(req, res) {
  try {
    const jobs = await jobModel.find({ postedBy: req.user.id });
    const jobIds = jobs.map((j) => j._id);

    const [total, shortlisted, rejected, hired, activeJobs] = await Promise.all(
      [
        applicationModel.countDocuments({ job: { $in: jobIds } }),
        applicationModel.countDocuments({
          job: { $in: jobIds },
          status: "shortlisted",
        }),
        applicationModel.countDocuments({
          job: { $in: jobIds },
          status: "rejected",
        }),
        applicationModel.countDocuments({
          job: { $in: jobIds },
          status: "hired",
        }),
        jobModel.countDocuments({ postedBy: req.user.id, isActive: true }),
      ],
    );

    return res.status(200).json({
      message: "Stats fetched successfully",
      stats: {
        totalJobs: jobs.length,
        activeJobs,
        totalApplicants: total,
        shortlisted,
        rejected,
        hired,
      },
    });
  } catch (error) {
    console.error("GetRecruiterStats error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

module.exports = {
  applyToJobController,
  getMyApplicationsController,
  getMyApplicationByIdController,
  getJobApplicantsController,
  updateApplicationStatusController,
  getRecruiterStatsController,
};
