const jobModel = require("../models/job.model");
const resumeModel = require("../models/resume.model");
const { enhanceJobDescription } = require("../services/ai.service");

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @route   POST /api/jobs
 * @desc    Recruiter posts a new job
 * @access  Private (recruiter)
 */
async function createJobController(req, res) {
  try {
    const {
      title,
      description,
      companyName,
      companyWebsite,
      location,
      requiredSkills,
      experienceLevel,
      salaryMin,
      salaryMax,
      jobType,
    } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    const job = await jobModel.create({
      title,
      description,
      companyName: companyName || req.user.companyName || "",
      companyWebsite: companyWebsite || "",
      location: location || "Remote",
      requiredSkills: requiredSkills || [],
      experienceLevel: experienceLevel || "junior",
      salaryMin: salaryMin || 0,
      salaryMax: salaryMax || 0,
      jobType: jobType || "full-time",
      postedBy: req.user.id,
    });

    return res.status(201).json({
      message: "Job posted successfully",
      job,
    });
  } catch (error) {
    console.error("CreateJob error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   POST /api/jobs/enhance
 * @desc    Recruiter uses AI to enhance job description before posting
 * @access  Private (recruiter)
 */
async function enhanceJobController(req, res) {
  try {
    const { title, description, requiredSkills, experienceLevel } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    const enhanced = await enhanceJobDescription({
      title,
      description,
      requiredSkills: requiredSkills || [],
      experienceLevel: experienceLevel || "junior",
    });

    return res.status(200).json({
      message: "Job description enhanced successfully",
      ...enhanced,
    });
  } catch (error) {
    console.error("EnhanceJob error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   GET /api/jobs
 * @desc    Get all active jobs with filters
 * @access  Public
 */
async function getAllJobsController(req, res) {
  try {
    const {
      search,
      location,
      experienceLevel,
      jobType,
      salaryMin,
      salaryMax,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { isActive: true };

    if (search) {
      filter.$text = { $search: search };
    }
    if (location) filter.location = { $regex: location, $options: "i" };
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (jobType) filter.jobType = jobType;
    if (salaryMin) filter.salaryMin = { $gte: Number(salaryMin) };
    if (salaryMax) filter.salaryMax = { $lte: Number(salaryMax) };

    const skip = (Number(page) - 1) * Number(limit);

    const [jobs, total] = await Promise.all([
      jobModel
        .find(filter)
        .populate("postedBy", "username companyName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      jobModel.countDocuments(filter),
    ]);

    return res.status(200).json({
      message: "Jobs fetched successfully",
      jobs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("GetAllJobs error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   GET /api/jobs/:jobId
 * @desc    Get single job details
 * @access  Public
 */
async function getJobByIdController(req, res) {
  try {
    const job = await jobModel
      .findById(req.params.jobId)
      .populate("postedBy", "username companyName companyWebsite");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json({
      message: "Job fetched successfully",
      job,
    });
  } catch (error) {
    console.error("GetJobById error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   PUT /api/jobs/:jobId
 * @desc    Recruiter updates a job
 * @access  Private (recruiter — owner only)
 */
async function updateJobController(req, res) {
  try {
    const job = await jobModel.findOne({
      _id: req.params.jobId,
      postedBy: req.user.id,
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found or unauthorized" });
    }

    const allowed = [
      "title",
      "description",
      "location",
      "requiredSkills",
      "experienceLevel",
      "salaryMin",
      "salaryMax",
      "jobType",
      "isActive",
      "aiEnhancedDescription",
      "aiSuggestedSkills",
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) job[field] = req.body[field];
    });

    await job.save();

    return res.status(200).json({
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    console.error("UpdateJob error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   DELETE /api/jobs/:jobId
 * @desc    Recruiter deletes a job
 * @access  Private (recruiter — owner only)
 */
async function deleteJobController(req, res) {
  try {
    const job = await jobModel.findOneAndDelete({
      _id: req.params.jobId,
      postedBy: req.user.id,
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found or unauthorized" });
    }

    return res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("DeleteJob error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   GET /api/jobs/recruiter/my-jobs
 * @desc    Get all jobs posted by the logged-in recruiter
 * @access  Private (recruiter)
 */
async function getMyJobsController(req, res) {
  try {
    const jobs = await jobModel
      .find({ postedBy: req.user.id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Your jobs fetched successfully",
      jobs,
    });
  } catch (error) {
    console.error("GetMyJobs error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   GET /api/jobs/recommended
 * @desc    AI-recommended jobs for the logged-in job seeker based on their skills
 * @access  Private (jobseeker)
 */
async function getRecommendedJobsController(req, res) {
  try {
    const userModel = require("../models/user.model");
    const user = await userModel.findById(req.user.id);

    // Get jobs that match the user's skills
    const jobs = await jobModel
      .find({
        isActive: true,
        requiredSkills: {
          $elemMatch: {
            $in: user.skills.map((s) => new RegExp(s, "i")),
          },
        },
      })
      .populate("postedBy", "username companyName")
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      message: "Recommended jobs fetched successfully",
      jobs,
    });
  } catch (error) {
    console.error("GetRecommendedJobs error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

module.exports = {
  createJobController,
  enhanceJobController,
  getAllJobsController,
  getJobByIdController,
  updateJobController,
  deleteJobController,
  getMyJobsController,
  getRecommendedJobsController,
};
