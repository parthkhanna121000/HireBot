const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    // ── Owner ────────────────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Resume Content ───────────────────────────────────────────────
    originalText: {
      type: String,
      required: true, // extracted PDF text
    },
    fileName: {
      type: String,
      default: "resume.pdf",
    },

    // ── AI Score & Analysis ──────────────────────────────────────────
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    atsScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // ── Match Breakdown (per JD analysis) ───────────────────────────
    skillsMatch: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    experienceMatch: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    keywordsMatch: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // ── Skill Gaps ───────────────────────────────────────────────────
    missingSkills: {
      type: [String],
      default: [],
    },
    skillGaps: [
      {
        skill: { type: String },
        severity: { type: String, enum: ["low", "medium", "high"] },
        _id: false,
      },
    ],

    // ── Problems Found ───────────────────────────────────────────────
    problems: {
      type: [String],
      default: [],
    },

    // ── AI Suggestions ───────────────────────────────────────────────
    suggestions: {
      type: [String],
      default: [],
    },

    // ── Bullet Point Rewrites ────────────────────────────────────────
    bulletRewrites: [
      {
        original: { type: String },
        improved: { type: String },
        _id: false,
      },
    ],

    // ── Highlighted Sections ─────────────────────────────────────────
    goodParts: {
      type: [String],
      default: [],
    },
    weakParts: {
      type: [String],
      default: [],
    },

    // ── Job Description used for analysis ────────────────────────────
    jobDescriptionUsed: {
      type: String,
      default: "",
    },
    jobRoleUsed: {
      type: String,
      default: "",
    },

    // ── Linked Job (optional) ────────────────────────────────────────
    linkedJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      default: null,
    },
  },
  { timestamps: true },
);

const resumeModel = mongoose.model("Resume", resumeSchema);

module.exports = resumeModel;
