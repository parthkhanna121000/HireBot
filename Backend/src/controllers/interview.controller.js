const pdfParse = require("pdf-parse-new");
const interviewReportModel = require("../models/interviewReport.model");
const {
  generateInterviewReport,
  generateAnswerIfMissing,
  generateTasksIfMissing,
  generateResumePdf,
} = require("../services/ai.service");
const { incrementUsage } = require("../middlewares/checkPlanLimit.middleware"); // ← NEW
const { pushNotification } = require("./notification.controller"); // ← NEW

async function extractTextFromPdf(buffer) {
  const data = await pdfParse(buffer);
  return data?.text || "";
}

// ─── SANITIZERS ───────────────────────────────────────────────────────────────
const VALID_DIFF = new Set(["Easy", "Medium", "Hard"]);
const VALID_SEV = new Set(["low", "medium", "high"]);

function isEmbeddedJson(s) {
  return (
    s.includes('"intention"') ||
    s.includes('"answer"') ||
    /intention["']?\s*:/i.test(s)
  );
}

function parseEmbedded(str) {
  try {
    const parsed = JSON.parse(str.startsWith("{") ? str : `{${str}}`);
    if (parsed.question || parsed.answer)
      return {
        question: String(parsed.question || "").trim(),
        difficulty: VALID_DIFF.has(parsed.difficulty)
          ? parsed.difficulty
          : "Medium",
        intention: String(parsed.intention || "").trim(),
        answer: String(parsed.answer || "").trim(),
        keyPoints: Array.isArray(parsed.keyPoints)
          ? parsed.keyPoints.filter(Boolean).map(String)
          : [],
      };
  } catch {}
  const am = str.match(
    /["']?answer["']?\s*["':]+\s*["']?([\s\S]+?)["']?\s*(?:,\s*["']?keyPoints|$)/i,
  );
  return {
    question: str.trim(),
    difficulty: "Medium",
    intention: "",
    answer: am ? am[1].replace(/["',}\s]*$/, "").trim() : "",
    keyPoints: [],
  };
}

function isSTARContent(text) {
  if (!text) return false;
  return (
    /^situation\s*:/i.test(text.trim()) ||
    /^my task was/i.test(text.trim()) ||
    (/situation\s*:/i.test(text) && /task\s*:/i.test(text))
  );
}

function sanitizeQuestions(arr, isBehavioral = false) {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter(Boolean)
    .map((item, idx) => {
      if (typeof item === "object" && item !== null) {
        const rawQ = String(item.question || "").trim();
        const rawI = String(item.intention || "").trim();
        const rawA = String(item.answer || "").trim();

        if (isSTARContent(rawQ) && rawA.length < 20) {
          return {
            question: item.originalQuestion
              ? String(item.originalQuestion).trim()
              : `Behavioral Question ${idx + 1}`,
            difficulty: VALID_DIFF.has(item.difficulty)
              ? item.difficulty
              : "Medium",
            intention: rawI,
            answer: rawQ,
            keyPoints: Array.isArray(item.keyPoints)
              ? item.keyPoints.filter(Boolean).map(String)
              : [],
          };
        }

        if (isEmbeddedJson(rawQ) && (!rawI || !rawA))
          return parseEmbedded(rawQ);

        return {
          question: rawQ,
          difficulty: VALID_DIFF.has(item.difficulty)
            ? item.difficulty
            : "Medium",
          intention: rawI,
          answer: rawA,
          keyPoints: Array.isArray(item.keyPoints)
            ? item.keyPoints.filter(Boolean).map(String)
            : [],
        };
      }
      if (typeof item === "string") {
        const str = item.trim();
        if (isEmbeddedJson(str)) return parseEmbedded(str);
        if (isSTARContent(str)) {
          return {
            question: `Behavioral Question ${idx + 1}`,
            difficulty: "Medium",
            intention: "",
            answer: str,
            keyPoints: [],
          };
        }
        return {
          question: str,
          difficulty: "Medium",
          intention: "",
          answer: "",
          keyPoints: [],
        };
      }
      return {
        question: String(item || ""),
        difficulty: "Medium",
        intention: "",
        answer: "",
        keyPoints: [],
      };
    })
    .filter((q) => q.question.trim().length > 3);
}

function sanitizeSkillGaps(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.filter(Boolean).map((item) => {
    if (typeof item === "object" && item !== null)
      return {
        skill: String(item.skill || "").trim(),
        severity: VALID_SEV.has(item.severity) ? item.severity : "medium",
      };
    const str = String(item).trim();
    const prefix = str.match(/^(high|medium|low):\s*/i);
    return {
      severity: prefix ? prefix[1].toLowerCase() : "medium",
      skill: (prefix ? str.replace(prefix[0], "") : str)
        .split(/[.!\n]/)[0]
        .trim()
        .substring(0, 100),
    };
  });
}

function sanitizePreparationPlan(arr) {
  if (!Array.isArray(arr)) return [];
  const first = arr.find(Boolean);

  if (first && typeof first === "object") {
    return arr.filter(Boolean).map((item, idx) => {
      let focus = String(
        item.focus || item.topic || item.title || `Day ${idx + 1}`,
      ).trim();
      if (focus.length > 60) {
        focus = focus.split(/[.!\n]/)[0].trim();
        if (focus.length > 60) focus = focus.substring(0, 55).trim() + "…";
      }
      const tasks = Array.isArray(item.tasks)
        ? item.tasks.filter(Boolean).map(String)
        : [];
      return { day: Number(item.day) || idx + 1, focus, tasks };
    });
  }

  const days = [];
  let current = null;
  let inTasks = false;
  for (const raw of arr) {
    if (!raw) continue;
    const line = String(raw).trim();
    const dayMatch = line.match(/day\s*:?\s*(\d+)/i);
    if (dayMatch && /^day/i.test(line)) {
      if (current) days.push(current);
      let focus = line.replace(/^day\s*:?\s*[\d\-–&\s]+[:\s]*/i, "").trim();
      if (focus.length > 60) focus = focus.substring(0, 55).trim() + "…";
      current = {
        day: Number(dayMatch[1]),
        focus: focus || `Day ${dayMatch[1]}`,
        tasks: [],
      };
      inTasks = false;
      continue;
    }
    if (/^focus:/i.test(line)) {
      if (!current) current = { day: days.length + 1, focus: "", tasks: [] };
      let f = line.replace(/^focus:\s*/i, "").trim();
      if (f.length > 60) f = f.substring(0, 55) + "…";
      current.focus = f;
      inTasks = false;
      continue;
    }
    if (/^tasks?:/i.test(line)) {
      inTasks = true;
      const inline = line.replace(/^tasks?:\s*/i, "").trim();
      if (inline && current) current.tasks.push(inline);
      continue;
    }
    if (/^[-•*]\s+/.test(line) && current) {
      current.tasks.push(line.replace(/^[-•*]\s+/, "").trim());
      continue;
    }
    if (inTasks && line && current) current.tasks.push(line);
  }
  if (current) days.push(current);
  return days.filter((d) => d.focus);
}

function sanitizeMatchScore(raw) {
  if (typeof raw === "number")
    return Math.min(100, Math.max(0, Math.round(raw)));
  if (typeof raw === "string") {
    const n = Number(raw.replace(/[^0-9.]/g, ""));
    return isNaN(n) ? 0 : Math.min(100, Math.max(0, Math.round(n)));
  }
  return 0;
}

function buildFallbackPlan(skillGaps, matchScore) {
  const highGaps = skillGaps.filter((g) => g.severity === "high");
  const medGaps = skillGaps.filter((g) => g.severity === "medium");
  const days = [];
  let d = 1;
  if (highGaps[0])
    days.push({
      day: d++,
      focus: `Critical: ${highGaps[0].skill.substring(0, 40)}`,
      tasks: [],
    });
  if (highGaps[1] || medGaps[0]) {
    const g = highGaps[1] || medGaps[0];
    days.push({
      day: d++,
      focus: `Key skill: ${g.skill.substring(0, 35)}`,
      tasks: [],
    });
  }
  days.push({ day: d++, focus: "Technical interview practice", tasks: [] });
  days.push({ day: d++, focus: "Behavioral questions & STAR", tasks: [] });
  days.push({ day: d++, focus: "Mock interview + final review", tasks: [] });
  return days;
}

// ─── CONTROLLER: Generate Interview Report ────────────────────────────────────
async function generateInterViewReportController(req, res) {
  try {
    const file = req.file;
    const { jobDescription = "", selfDescription = "", title = "" } = req.body;
    if (!jobDescription.trim())
      return res
        .status(400)
        .json({ success: false, message: "Job description is required" });
    if (!title.trim())
      return res
        .status(400)
        .json({ success: false, message: "Job title is required" });

    let resumeText = "";
    if (file) resumeText = await extractTextFromPdf(file.buffer);

    // STEP 1 — main report
    const report = await generateInterviewReport({
      resume: resumeText,
      selfDescription,
      jobDescription,
      title,
    });
    if (!report)
      return res
        .status(500)
        .json({ success: false, message: "AI report generation failed" });

    let sanitizedTQ = sanitizeQuestions(report.technicalQuestions, false);
    let sanitizedBQ = sanitizeQuestions(report.behavioralQuestions, true);
    let sanitizedPP = sanitizePreparationPlan(report.preparationPlan);
    const sanitizedSG = sanitizeSkillGaps(report.skillGaps);

    console.log("[IV STEP1]", {
      matchScore: report.matchScore,
      tq: sanitizedTQ.length,
      tqEmpty: sanitizedTQ.filter((q) => !q.answer || q.answer.length < 50)
        .length,
      bq: sanitizedBQ.length,
      bqEmpty: sanitizedBQ.filter((q) => !q.answer || q.answer.length < 50)
        .length,
      pp: sanitizedPP.length,
      ppEmpty: sanitizedPP.filter((d) => !d.tasks || d.tasks.length === 0)
        .length,
    });

    // STEP 2 — fill empty answers (batched)
    if (sanitizedTQ.some((q) => !q.answer || q.answer.length < 50))
      sanitizedTQ = await generateAnswerIfMissing(
        sanitizedTQ,
        jobDescription,
        title,
      );
    if (sanitizedBQ.some((q) => !q.answer || q.answer.length < 50))
      sanitizedBQ = await generateAnswerIfMissing(
        sanitizedBQ,
        jobDescription,
        title,
      );

    // STEP 3 — fill empty tasks (batched)
    if (sanitizedPP.length === 0)
      sanitizedPP = buildFallbackPlan(
        sanitizedSG,
        sanitizeMatchScore(report.matchScore),
      );
    if (sanitizedPP.some((d) => !d.tasks || d.tasks.length === 0))
      sanitizedPP = await generateTasksIfMissing(
        sanitizedPP,
        jobDescription,
        sanitizedSG,
      );

    console.log("[IV STEP2 FINAL]", {
      tqAnswerLengths: sanitizedTQ.map((q) => q.answer?.length || 0),
      ppTaskCounts: sanitizedPP.map((d) => d.tasks?.length || 0),
    });

    const reportDoc = await interviewReportModel.create({
      jobDescription,
      resume: resumeText,
      selfDescription,
      matchScore: sanitizeMatchScore(report.matchScore),
      technicalQuestions: sanitizedTQ,
      behavioralQuestions: sanitizedBQ,
      skillGaps: sanitizedSG,
      preparationPlan: sanitizedPP,
      title: String(report.title || title).trim(),
      user: req.user.id,
    });

    // ── NEW: increment usage counter + push notification ───────────────────
    await incrementUsage(req.user.id, "interviewReports");

    // Non-blocking — notification failure never crashes the response
    pushNotification({
      userId: req.user.id,
      type: "interview",
      title: "Interview Report Ready 🎤",
      message: `Your interview prep report for "${String(report.title || title).trim()}" is ready.`,
      link: `/interview-prep?reportId=${reportDoc._id}`,
    });

    return res.status(201).json({
      success: true,
      message: "Interview report generated successfully",
      data: reportDoc,
    });
  } catch (error) {
    console.error("GenerateInterviewReport error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
}

async function getInterviewReportByIdController(req, res) {
  try {
    const report = await interviewReportModel.findOne({
      _id: req.params.interviewId,
      user: req.user.id,
    });
    if (!report)
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    return res.status(200).json({ success: true, data: report });
  } catch {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch report" });
  }
}

async function getAllInterviewReportsController(req, res) {
  try {
    const reports = await interviewReportModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select(
        "title matchScore skillGaps preparationPlan technicalQuestions behavioralQuestions createdAt",
      );
    return res.status(200).json({ success: true, data: reports });
  } catch {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch reports" });
  }
}

async function deleteInterviewReportController(req, res) {
  try {
    const deleted = await interviewReportModel.findOneAndDelete({
      _id: req.params.interviewId,
      user: req.user.id,
    });
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    return res.status(200).json({ success: true, message: "Report deleted" });
  } catch {
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete report" });
  }
}

async function generateResumePdfController(req, res) {
  try {
    const report = await interviewReportModel.findOne({
      _id: req.params.interviewReportId,
      user: req.user.id,
    });
    if (!report)
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    const pdfBuffer = await generateResumePdf({
      resume: report.resume || "",
      jobDescription: report.jobDescription,
      selfDescription: report.selfDescription || "",
    });
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${report._id}.pdf`,
    });
    return res.send(pdfBuffer);
  } catch (err) {
    console.error("GenerateResumePdf (interview):", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to generate PDF" });
  }
}

module.exports = {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  deleteInterviewReportController,
  generateResumePdfController,
};
