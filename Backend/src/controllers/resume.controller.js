const pdfParse = require("pdf-parse-new");
const resumeModel = require("../models/resume.model");
const {
  analyzeResume,
  rewriteBulletPoint,
  generateResumePdf,
} = require("../services/ai.service");

// ─── Helper ───────────────────────────────────────────────────────────────────
async function extractTextFromPdf(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @route   POST /api/resume/analyze
 * @desc    Upload resume PDF + JD → get AI score, skill gaps, suggestions
 * @access  Private (jobseeker)
 */
async function analyzeResumeController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a resume PDF" });
    }

    const { jobDescription, jobRole } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ message: "Job description is required" });
    }

    // Extract text from PDF
    const resumeText = await extractTextFromPdf(req.file.buffer);

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        message:
          "Could not extract text from PDF. Please upload a valid resume.",
      });
    }

    // Run AI analysis
    const analysis = await analyzeResume({
      resume: resumeText,
      jobDescription,
      jobRole: jobRole || "",
    });

    // Save to DB
    const resume = await resumeModel.create({
      user: req.user.id,
      originalText: resumeText,
      fileName: req.file.originalname || "resume.pdf",
      jobDescriptionUsed: jobDescription,
      jobRoleUsed: jobRole || "",
      ...analysis,
    });

    return res.status(201).json({
      message: "Resume analyzed successfully",
      resume,
    });
  } catch (error) {
    console.error("AnalyzeResume error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   GET /api/resume/
 * @desc    Get all resumes (analyses) of logged-in user
 * @access  Private (jobseeker)
 */
async function getAllResumesController(req, res) {
  try {
    const resumes = await resumeModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select("-originalText -bulletRewrites -goodParts -weakParts");

    return res.status(200).json({
      message: "Resumes fetched successfully",
      resumes,
    });
  } catch (error) {
    console.error("GetAllResumes error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   GET /api/resume/:resumeId
 * @desc    Get a single resume analysis by ID
 * @access  Private (jobseeker)
 */
async function getResumeByIdController(req, res) {
  try {
    const resume = await resumeModel.findOne({
      _id: req.params.resumeId,
      user: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.status(200).json({
      message: "Resume fetched successfully",
      resume,
    });
  } catch (error) {
    console.error("GetResumeById error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   DELETE /api/resume/:resumeId
 * @desc    Delete a resume analysis
 * @access  Private (jobseeker)
 */
async function deleteResumeController(req, res) {
  try {
    const resume = await resumeModel.findOneAndDelete({
      _id: req.params.resumeId,
      user: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("DeleteResume error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   POST /api/resume/rewrite-bullet
 * @desc    Rewrite a single weak bullet point using AI
 * @access  Private (jobseeker)
 */
async function rewriteBulletController(req, res) {
  try {
    const { bulletPoint, jobRole, jobDescription } = req.body;

    if (!bulletPoint) {
      return res
        .status(400)
        .json({ message: "Please provide a bullet point to rewrite" });
    }

    const result = await rewriteBulletPoint({
      bulletPoint,
      jobRole,
      jobDescription,
    });

    return res.status(200).json({
      message: "Bullet point rewritten successfully",
      original: bulletPoint,
      ...result,
    });
  } catch (error) {
    console.error("RewriteBullet error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   POST /api/resume/generate-pdf/:resumeId
 * @desc    Generate an optimized resume PDF for a given analysis
 * @access  Private (jobseeker)
 */
async function generateResumePdfController(req, res) {
  try {
    const resume = await resumeModel.findOne({
      _id: req.params.resumeId,
      user: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const pdfBuffer = await generateResumePdf({
      resume: resume.originalText,
      jobDescription: resume.jobDescriptionUsed,
      selfDescription: "",
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=optimized_resume_${resume._id}.pdf`,
    });

    return res.send(pdfBuffer);
  } catch (error) {
    console.error("GenerateResumePdf error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

module.exports = {
  analyzeResumeController,
  getAllResumesController,
  getResumeByIdController,
  deleteResumeController,
  rewriteBulletController,
  generateResumePdfController,
};
