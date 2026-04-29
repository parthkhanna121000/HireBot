// const mongoose = require("mongoose");

// const resumeSchema = new mongoose.Schema(
//   {
//     // ── Owner ────────────────────────────────────────────────────────────────
//     user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

//     // ── Content ──────────────────────────────────────────────────────────────
//     originalText: { type: String, required: true },
//     fileName: { type: String, default: "resume.pdf" },

//     // ── Core Scores ──────────────────────────────────────────────────────────
//     overallScore: { type: Number, min: 0, max: 100, default: 0 },
//     atsScore: { type: Number, min: 0, max: 100, default: 0 },
//     skillsMatch: { type: Number, min: 0, max: 100, default: 0 },
//     experienceMatch: { type: Number, min: 0, max: 100, default: 0 },
//     keywordsMatch: { type: Number, min: 0, max: 100, default: 0 },

//     // ── Skill Analysis ────────────────────────────────────────────────────────
//     missingSkills: { type: [String], default: [] },
//     skillGaps: [
//       {
//         skill: { type: String },
//         severity: { type: String, enum: ["low", "medium", "high"] },
//         _id: false,
//       },
//     ],

//     // ── Feedback ──────────────────────────────────────────────────────────────
//     problems: { type: [String], default: [] },
//     suggestions: { type: [String], default: [] },

//     // ── Rewrites ─────────────────────────────────────────────────────────────
//     bulletRewrites: [
//       {
//         original: { type: String },
//         improved: { type: String },
//         _id: false,
//       },
//     ],

//     goodParts: { type: [String], default: [] },
//     weakParts: { type: [String], default: [] },

//     // ── JD context ───────────────────────────────────────────────────────────
//     jobDescriptionUsed: { type: String, default: "" },
//     jobRoleUsed: { type: String, default: "" },
//     linkedJob: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Job",
//       default: null,
//     },

//     // ── NEW: Rich AI output ───────────────────────────────────────────────────
//     // Why each sub-score is what it is (4-6 factors)
//     scoreBreakdown: {
//       type: [
//         {
//           factor: { type: String, default: "" },
//           score: { type: Number, min: 0, max: 100, default: 0 },
//           reason: { type: String, default: "" },
//           _id: false,
//         },
//       ],
//       default: [],
//     },

//     // Suggestions ranked by hiring impact
//     rankedSuggestions: {
//       type: [
//         {
//           text: { type: String, default: "" },
//           impact: {
//             type: String,
//             enum: ["high", "medium", "low"],
//             default: "medium",
//           },
//           _id: false,
//         },
//       ],
//       default: [],
//     },

//     // Simulated recruiter decision
//     hiringDecision: {
//       shortlistProbability: { type: Number, min: 0, max: 100, default: 0 },
//       recommendation: { type: String, default: "" },
//       topRejectionReasons: { type: [String], default: [] },
//     },
//   },
//   { timestamps: true },
// );

// const resumeModel = mongoose.model("Resume", resumeSchema);
// module.exports = resumeModel;
const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    originalText: { type: String, required: true },
    fileName: { type: String, default: "resume.pdf" },

    // ── Core scores ───────────────────────────────────────────────────────────
    overallScore: { type: Number, min: 0, max: 100, default: 0 },
    atsScore: { type: Number, min: 0, max: 100, default: 0 },
    skillsMatch: { type: Number, min: 0, max: 100, default: 0 },
    experienceMatch: { type: Number, min: 0, max: 100, default: 0 },
    keywordsMatch: { type: Number, min: 0, max: 100, default: 0 },

    // ── Basic arrays ──────────────────────────────────────────────────────────
    missingSkills: { type: [String], default: [] },
    problems: { type: [String], default: [] },
    suggestions: { type: [String], default: [] },
    goodParts: { type: [String], default: [] },
    weakParts: { type: [String], default: [] },

    bulletRewrites: [
      { original: { type: String }, improved: { type: String }, _id: false },
    ],

    skillGaps: [
      {
        skill: { type: String },
        severity: { type: String, enum: ["low", "medium", "high"] },
        _id: false,
      },
    ],

    jobDescriptionUsed: { type: String, default: "" },
    jobRoleUsed: { type: String, default: "" },
    linkedJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      default: null,
    },

    // ── Score transparency ────────────────────────────────────────────────────
    scoreBreakdown: {
      type: [
        {
          factor: { type: String, default: "" },
          score: { type: Number, default: 0 },
          reason: { type: String, default: "" },
          _id: false,
        },
      ],
      default: [],
    },

    // ── Hiring diagnosis ──────────────────────────────────────────────────────
    hiringDiagnosis: {
      primaryConcern: { type: String, default: "" },
      secondaryGaps: { type: [String], default: [] },
      strengths: { type: [String], default: [] },
    },

    // ── Deep skill gap intelligence ───────────────────────────────────────────
    skillGapIntelligence: {
      type: [
        {
          skill: { type: String, default: "" },
          impact: {
            type: String,
            enum: ["high", "medium", "low"],
            default: "medium",
          },
          whyMissing: { type: String, default: "" },
          hiringEffect: { type: String, default: "" },
          fixPlan: { type: [String], default: [] },
          _id: false,
        },
      ],
      default: [],
    },

    // ── Ranked suggestions ────────────────────────────────────────────────────
    rankedSuggestions: {
      type: [
        {
          text: { type: String, default: "" },
          impact: {
            type: String,
            enum: ["high", "medium", "low"],
            default: "medium",
          },
          _id: false,
        },
      ],
      default: [],
    },

    // ── Action plan ───────────────────────────────────────────────────────────
    actionPlan: {
      mustFix: { type: [String], default: [] },
      nextPriority: { type: [String], default: [] },
      optional: { type: [String], default: [] },
    },

    // ── Hiring outlook ────────────────────────────────────────────────────────
    hiringOutlook: {
      shortlistProbability: { type: Number, min: 0, max: 100, default: 0 },
      interviewConversion: { type: Number, min: 0, max: 100, default: 0 },
      riskLevel: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
      rejectionReasons: { type: [String], default: [] },
      verdict: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Resume", resumeSchema);
