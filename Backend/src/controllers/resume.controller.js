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
  return data?.text || "";
}

// ─── Coerce numeric scores (camelCase + snake_case fallback) ──────────────────
function extractScore(obj, camel, snake) {
  const val = obj[camel] ?? obj[snake];
  const n = Number(val);
  return isNaN(n) ? 0 : Math.min(100, Math.max(0, Math.round(n)));
}

// ─── Sanitise the new rich fields ────────────────────────────────────────────
function sanitizeScoreBreakdown(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.filter(Boolean).map((item) => ({
    factor: String(item.factor || "").trim(),
    score: Number(item.score) || 0,
    reason: String(item.reason || "").trim(),
  }));
}

function sanitizeRankedSuggestions(arr) {
  if (!Array.isArray(arr)) return [];
  const valid = new Set(["high", "medium", "low"]);
  return arr.filter(Boolean).map((item) => {
    if (typeof item === "string") return { text: item, impact: "medium" };
    return {
      text: String(item.text || item.suggestion || "").trim(),
      impact: valid.has(item.impact) ? item.impact : "medium",
    };
  });
}

function sanitizeHiringDecision(obj) {
  if (!obj || typeof obj !== "object") {
    return {
      shortlistProbability: 0,
      recommendation: "",
      topRejectionReasons: [],
    };
  }
  return {
    shortlistProbability: Number(obj.shortlistProbability) || 0,
    recommendation: String(obj.recommendation || "").trim(),
    topRejectionReasons: Array.isArray(obj.topRejectionReasons)
      ? obj.topRejectionReasons.filter(Boolean).map(String)
      : [],
  };
}

// ─── Sanitise bulletRewrites (guard against Gemini returning strings) ─────────
function sanitizeBulletRewrites(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.filter(Boolean).map((item) => {
    if (typeof item === "string") {
      const origMatch = item.match(/original:\s*([\s\S]*?)(?=improved:|$)/i);
      const imprMatch = item.match(/improved:\s*([\s\S]*)$/i);
      return {
        original: origMatch ? origMatch[1].trim() : item,
        improved: imprMatch ? imprMatch[1].trim() : "",
      };
    }
    return {
      original: String(item.original || "").trim(),
      improved: String(item.improved || "").trim(),
    };
  });
}

// ─── Sanitise skillGaps ───────────────────────────────────────────────────────
function sanitizeSkillGaps(arr) {
  if (!Array.isArray(arr)) return [];
  const valid = new Set(["low", "medium", "high"]);
  return arr.filter(Boolean).map((item) => {
    if (typeof item === "string") {
      const prefix = item.match(/^(high|medium|low):\s*/i);
      const severity = prefix ? prefix[1].toLowerCase() : "medium";
      const skill = prefix ? item.replace(prefix[0], "") : item;
      return {
        skill: skill
          .split(/[.!\n]/)[0]
          .trim()
          .substring(0, 100),
        severity,
      };
    }
    return {
      skill: String(item.skill || "").trim(),
      severity: valid.has(item.severity) ? item.severity : "medium",
    };
  });
}

// ─── CONTROLLER: Analyze Resume ───────────────────────────────────────────────
async function analyzeResumeController(req, res) {
  try {
    const file = req.file;
    const { jobDescription = "", jobRole = "" } = req.body;

    if (!file)
      return res
        .status(400)
        .json({ success: false, message: "Resume file is required" });
    if (!jobDescription.trim())
      return res
        .status(400)
        .json({ success: false, message: "Job description is required" });

    const resumeText = await extractTextFromPdf(file.buffer);
    if (!resumeText || resumeText.trim().length < 50)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or unreadable resume PDF" });

    const raw = await analyzeResume({
      resume: resumeText,
      jobDescription,
      jobRole,
    });

    if (!raw)
      return res
        .status(500)
        .json({ success: false, message: "AI analysis failed" });

    // ── Debug logs ─────────────────────────────────────────────────────────
    console.log("[RESUME RAW keys from Gemini]", Object.keys(raw));
    console.log("[RESUME SCORES from Gemini]", {
      overallScore: raw.overallScore ?? raw.overall_score,
      atsScore: raw.atsScore ?? raw.ats_score,
      skillsMatch: raw.skillsMatch ?? raw.skills_match,
      experienceMatch: raw.experienceMatch ?? raw.experience_match,
      keywordsMatch: raw.keywordsMatch ?? raw.keywords_match,
    });
    console.log("[RESUME NEW FIELDS from Gemini]", {
      scoreBreakdownLen: Array.isArray(raw.scoreBreakdown)
        ? raw.scoreBreakdown.length
        : "missing",
      rankedSuggestionsLen: Array.isArray(raw.rankedSuggestions)
        ? raw.rankedSuggestions.length
        : "missing",
      hiringDecision: raw.hiringDecision
        ? JSON.stringify(raw.hiringDecision).substring(0, 100)
        : "missing",
    });

    // ── Build safe document ────────────────────────────────────────────────
    const safeDoc = {
      user: req.user.id,
      originalText: resumeText,
      fileName: file.originalname || "resume.pdf",
      jobDescriptionUsed: jobDescription,
      jobRoleUsed: jobRole,

      // Numeric scores — camelCase + snake_case fallback
      overallScore: extractScore(raw, "overallScore", "overall_score"),
      atsScore: extractScore(raw, "atsScore", "ats_score"),
      skillsMatch: extractScore(raw, "skillsMatch", "skills_match"),
      experienceMatch: extractScore(raw, "experienceMatch", "experience_match"),
      keywordsMatch: extractScore(raw, "keywordsMatch", "keywords_match"),

      // Arrays
      missingSkills: Array.isArray(raw.missingSkills ?? raw.missing_skills)
        ? (raw.missingSkills ?? raw.missing_skills)
        : [],
      skillGaps: sanitizeSkillGaps(raw.skillGaps ?? raw.skill_gaps),
      problems: Array.isArray(raw.problems) ? raw.problems : [],
      suggestions: Array.isArray(raw.suggestions) ? raw.suggestions : [],
      bulletRewrites: sanitizeBulletRewrites(
        raw.bulletRewrites ?? raw.bullet_rewrites,
      ),
      goodParts: Array.isArray(raw.goodParts ?? raw.good_parts)
        ? (raw.goodParts ?? raw.good_parts)
        : [],
      weakParts: Array.isArray(raw.weakParts ?? raw.weak_parts)
        ? (raw.weakParts ?? raw.weak_parts)
        : [],

      // New rich fields
      scoreBreakdown: sanitizeScoreBreakdown(raw.scoreBreakdown),
      rankedSuggestions: sanitizeRankedSuggestions(raw.rankedSuggestions),
      hiringDecision: sanitizeHiringDecision(raw.hiringDecision),
    };

    const resumeDoc = await resumeModel.create(safeDoc);

    return res.status(201).json({
      success: true,
      message: "Resume analyzed successfully",
      data: resumeDoc,
    });
  } catch (error) {
    console.error("AnalyzeResume error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error while analyzing resume" });
  }
}

// ─── CONTROLLER: Get All Resumes ──────────────────────────────────────────────
async function getAllResumesController(req, res) {
  try {
    const resumes = await resumeModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select("-originalText");
    return res
      .status(200)
      .json({ success: true, message: "Resumes fetched", data: resumes });
  } catch (error) {
    console.error("GetAllResumes:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch resumes" });
  }
}

// ─── CONTROLLER: Get Resume by ID ─────────────────────────────────────────────
async function getResumeByIdController(req, res) {
  try {
    const resume = await resumeModel.findOne({
      _id: req.params.resumeId,
      user: req.user.id,
    });
    if (!resume)
      return res
        .status(404)
        .json({ success: false, message: "Resume not found" });
    return res
      .status(200)
      .json({ success: true, message: "Resume fetched", data: resume });
  } catch (error) {
    console.error("GetResumeById:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch resume" });
  }
}

// ─── CONTROLLER: Delete Resume ────────────────────────────────────────────────
async function deleteResumeController(req, res) {
  try {
    const deleted = await resumeModel.findOneAndDelete({
      _id: req.params.resumeId,
      user: req.user.id,
    });
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Resume not found" });
    return res.status(200).json({ success: true, message: "Resume deleted" });
  } catch (error) {
    console.error("DeleteResume:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete resume" });
  }
}

// ─── CONTROLLER: Rewrite Bullet ───────────────────────────────────────────────
async function rewriteBulletController(req, res) {
  try {
    const { bulletPoint, jobRole = "", jobDescription = "" } = req.body;
    if (!bulletPoint?.trim())
      return res
        .status(400)
        .json({ success: false, message: "Bullet point is required" });
    const result = await rewriteBulletPoint({
      bulletPoint,
      jobRole,
      jobDescription,
    });
    return res
      .status(200)
      .json({ success: true, message: "Bullet rewritten", data: result });
  } catch (error) {
    console.error("RewriteBullet:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to rewrite bullet" });
  }
}

// ─── CONTROLLER: Generate PDF ─────────────────────────────────────────────────
async function generateResumePdfController(req, res) {
  try {
    const resume = await resumeModel.findOne({
      _id: req.params.resumeId,
      user: req.user.id,
    });
    if (!resume)
      return res
        .status(404)
        .json({ success: false, message: "Resume not found" });

    const pdfBuffer = await generateResumePdf({
      resume: resume.originalText,
      jobDescription: resume.jobDescriptionUsed,
      selfDescription: "",
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${resume._id}.pdf`,
    });
    return res.send(pdfBuffer);
  } catch (error) {
    console.error("GenerateResumePdf:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to generate PDF" });
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
