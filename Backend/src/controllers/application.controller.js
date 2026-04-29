const applicationModel = require("../models/application.model");
const jobModel = require("../models/job.model");
const userModel = require("../models/user.model"); // ← ADDED
const pdfParse = require("pdf-parse-new");
const { rankCandidate } = require("../services/ai.service");
const {
  sendApplicationEmail,
  sendShortlistEmail,
  sendRejectionEmail,
  sendInterviewInviteEmail,
} = require("../services/email.service"); // ← ADDED
const { pushNotification } = require("./notification.controller"); // ← ADDED

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * @route   POST /api/applications/apply/:jobId
 * @access  Private (jobseeker)
 */
async function applyToJobController(req, res) {
  try {
    const { jobId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message:
          "Resume PDF is required. Send it as multipart/form-data with field name 'resume'.",
      });
    }

    const existing = await applicationModel.findOne({
      job: jobId,
      applicant: req.user.id,
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "You have already applied to this job." });
    }

    const job = await jobModel.findById(jobId);
    if (!job || !job.isActive) {
      return res
        .status(404)
        .json({ message: "Job not found or no longer active." });
    }

    const parsed = await pdfParse(req.file.buffer);
    const resumeText = parsed?.text?.trim() || "";

    if (!resumeText) {
      return res.status(400).json({
        message:
          "Could not extract text from your PDF. Make sure it is not a scanned image.",
      });
    }

    let aiData = {
      matchScore: 0,
      skillsMatch: 0,
      experienceMatch: 0,
      keywordsMatch: 0,
      aiSummary: "",
      strengths: [],
      weaknesses: [],
      missingSkills: [],
    };

    try {
      aiData = await rankCandidate({
        resume: resumeText,
        jobDescription: job.description,
        jobTitle: job.title,
        requiredSkills: job.requiredSkills || [],
      });
    } catch (aiErr) {
      console.error(
        "[Application] AI ranking failed, saving with 0 scores:",
        aiErr.message,
      );
    }

    const application = await applicationModel.create({
      job: jobId,
      applicant: req.user.id,
      status: "applied",
      matchScore: aiData.matchScore ?? 0,
      skillsMatch: aiData.skillsMatch ?? 0,
      experienceMatch: aiData.experienceMatch ?? 0,
      keywordsMatch: aiData.keywordsMatch ?? 0,
      aiSummary: aiData.aiSummary ?? "",
      strengths: aiData.strengths ?? [],
      weaknesses: aiData.weaknesses ?? [],
      missingSkills: aiData.missingSkills ?? [],
    });

    // ── FIX: fetch real email from DB — req.user only has id/role from JWT ──
    const applicant = await userModel
      .findById(req.user.id)
      .select("email username");

    if (applicant) {
      sendApplicationEmail({
        to: applicant.email,
        name: applicant.username,
        jobTitle: job.title,
        companyName: job.companyName || null,
      }).catch((err) => console.error("[apply] email failed:", err.message));

      pushNotification({
        userId: req.user.id,
        type: "application",
        title: "Application Submitted 📋",
        message: `Your application for ${job.title} has been received and is under review.`,
        link: "/applications",
      }).catch((err) =>
        console.error("[apply] notification failed:", err.message),
      );
    }

    return res.status(201).json({
      message: "Application submitted successfully.",
      application,
    });
  } catch (error) {
    console.error("ApplyToJob error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   GET /api/applications/my
 * @access  Private (jobseeker)
 */
async function getMyApplicationsController(req, res) {
  try {
    const applications = await applicationModel
      .find({ applicant: req.user.id })
      .populate("job", "title companyName location jobType experienceLevel")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json({ message: "Applications fetched successfully.", applications });
  } catch (error) {
    console.error("GetMyApplications error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   GET /api/applications/my/:id
 * @access  Private (jobseeker)
 */
async function getSingleApplicationController(req, res) {
  try {
    const application = await applicationModel
      .findOne({ _id: req.params.id, applicant: req.user.id })
      .populate("job");

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    return res
      .status(200)
      .json({ message: "Application fetched successfully.", application });
  } catch (error) {
    console.error("GetSingleApplication error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   GET /api/applications/job/:jobId
 * @access  Private (recruiter)
 */
async function getJobApplicantsController(req, res) {
  try {
    const applications = await applicationModel
      .find({ job: req.params.jobId })
      .populate("applicant", "username email skills experienceLevel")
      .populate("job", "title companyName requiredSkills")
      .sort({ matchScore: -1 });

    return res
      .status(200)
      .json({ message: "Applicants fetched successfully.", applications });
  } catch (error) {
    console.error("GetJobApplicants error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   PUT /api/applications/:id/status
 * @access  Private (recruiter)
 */
async function updateApplicationStatusController(req, res) {
  try {
    const { status, recruiterNote, date, time, instructions } = req.body;

    const validStatuses = ["applied", "shortlisted", "rejected", "hired"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // populate applicant so we have real email + username
    const application = await applicationModel
      .findById(req.params.id)
      .populate("applicant", "username email")
      .populate("job", "title companyName postedBy");

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    if (application.job?.postedBy?.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorised to update this application.",
      });
    }

    if (status) application.status = status;
    if (recruiterNote !== undefined) application.recruiterNote = recruiterNote;
    await application.save();

    const applicantEmail = application.applicant?.email;
    const applicantName = application.applicant?.username;
    const applicantUserId = application.applicant?._id;
    const jobTitle = application.job?.title;
    const companyName = application.job?.companyName || null;

    if (status === "shortlisted") {
      sendShortlistEmail({
        to: applicantEmail,
        name: applicantName,
        jobTitle,
        companyName,
        recruiterNote: recruiterNote || "",
      }).catch((err) =>
        console.error("[status] shortlist email failed:", err.message),
      );

      pushNotification({
        userId: applicantUserId,
        type: "application",
        title: "You've Been Shortlisted 🎉",
        message: `Great news! You were shortlisted for ${jobTitle}.`,
        link: "/applications",
      }).catch((err) =>
        console.error("[status] shortlist notification failed:", err.message),
      );
    }

    if (status === "rejected") {
      sendRejectionEmail({
        to: applicantEmail,
        name: applicantName,
        jobTitle,
        companyName,
        recruiterNote: recruiterNote || "",
      }).catch((err) =>
        console.error("[status] rejection email failed:", err.message),
      );

      pushNotification({
        userId: applicantUserId,
        type: "application",
        title: "Application Update",
        message: `Your application for ${jobTitle} was not selected this time.`,
        link: "/applications",
      }).catch((err) =>
        console.error("[status] rejection notification failed:", err.message),
      );
    }

    if (status === "hired") {
      sendInterviewInviteEmail({
        to: applicantEmail,
        name: applicantName,
        jobTitle,
        companyName,
        date: date || null,
        time: time || null,
        instructions: instructions || null,
      }).catch((err) =>
        console.error("[status] interview email failed:", err.message),
      );

      pushNotification({
        userId: applicantUserId,
        type: "interview",
        title: "Interview Invitation 📅",
        message: `You've been invited to interview for ${jobTitle}!`,
        link: "/interview-prep",
      }).catch((err) =>
        console.error("[status] interview notification failed:", err.message),
      );
    }

    return res
      .status(200)
      .json({ message: "Application updated successfully.", application });
  } catch (error) {
    console.error("UpdateApplicationStatus error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   GET /api/applications/recruiter/stats
 * @access  Private (recruiter)
 */
async function getRecruiterStatsController(req, res) {
  try {
    const recruiterJobs = await jobModel
      .find({ postedBy: req.user.id })
      .select("_id isActive");

    const jobIds = recruiterJobs.map((j) => j._id);
    const activeJobs = recruiterJobs.filter((j) => j.isActive).length;
    const pausedJobs = recruiterJobs.length - activeJobs;

    if (jobIds.length === 0) {
      return res.status(200).json({
        totalApplicants: 0,
        shortlisted: 0,
        hired: 0,
        activeJobs,
        pausedJobs,
        avgMatchScore: 0,
        applicantsThisWeek: 0,
        shortlistedThisWeek: 0,
      });
    }

    const allApplications = await applicationModel.find({
      job: { $in: jobIds },
    });

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const totalApplicants = allApplications.length;
    const shortlisted = allApplications.filter(
      (a) => a.status === "shortlisted",
    ).length;
    const hired = allApplications.filter((a) => a.status === "hired").length;
    const applicantsThisWeek = allApplications.filter(
      (a) => new Date(a.createdAt) >= oneWeekAgo,
    ).length;
    const shortlistedThisWeek = allApplications.filter(
      (a) => a.status === "shortlisted" && new Date(a.updatedAt) >= oneWeekAgo,
    ).length;
    const avgMatchScore =
      totalApplicants > 0
        ? allApplications.reduce((s, a) => s + (a.matchScore || 0), 0) /
          totalApplicants
        : 0;

    return res.status(200).json({
      totalApplicants,
      shortlisted,
      hired,
      activeJobs,
      pausedJobs,
      avgMatchScore: Math.round(avgMatchScore),
      applicantsThisWeek,
      shortlistedThisWeek,
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
  getSingleApplicationController,
  getJobApplicantsController,
  updateApplicationStatusController,
  getRecruiterStatsController,
};
