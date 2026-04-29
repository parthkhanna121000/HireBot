// const mongoose = require("mongoose");

// const applicationSchema = new mongoose.Schema(
//   {
//     // ── References ───────────────────────────────────────────────────
//     job: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Job",
//       required: true,
//     },
//     applicant: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     resume: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Resume",
//       required: true,
//     },

//     // ── Application Status ───────────────────────────────────────────
//     status: {
//       type: String,
//       enum: ["applied", "shortlisted", "rejected", "hired"],
//       default: "applied",
//     },

//     // ── AI Match Data ────────────────────────────────────────────────
//     matchScore: {
//       type: Number,
//       min: 0,
//       max: 100,
//       default: 0,
//     },
//     skillsMatch: {
//       type: Number,
//       min: 0,
//       max: 100,
//       default: 0,
//     },
//     experienceMatch: {
//       type: Number,
//       min: 0,
//       max: 100,
//       default: 0,
//     },
//     keywordsMatch: {
//       type: Number,
//       min: 0,
//       max: 100,
//       default: 0,
//     },

//     // ── AI Candidate Summary (for recruiter view) ────────────────────
//     aiSummary: {
//       type: String,
//       default: "",
//     },
//     strengths: {
//       type: [String],
//       default: [],
//     },
//     weaknesses: {
//       type: [String],
//       default: [],
//     },
//     missingSkills: {
//       type: [String],
//       default: [],
//     },

//     // ── AI Feedback (for job seeker after rejection) ─────────────────
//     rejectionFeedback: {
//       type: String,
//       default: "",
//     },
//     improvementTips: {
//       type: [String],
//       default: [],
//     },

//     // ── Recruiter Note ───────────────────────────────────────────────
//     recruiterNote: {
//       type: String,
//       default: "",
//     },
//   },
//   { timestamps: true },
// );

// // Prevent duplicate applications
// applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// const applicationModel = mongoose.model("Application", applicationSchema);

// module.exports = applicationModel;

// application.model.js
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    // ── References ───────────────────────────────────────────────────
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // ── REMOVED: resume ObjectId ref ─────────────────────────────────
    // The new apply flow uploads a PDF directly; no Resume document is
    // created during application. Keeping this field required caused:
    // "ValidationError: Application validation failed: resume: Path `resume` is required."

    // ── Application Status ───────────────────────────────────────────
    status: {
      type: String,
      enum: ["applied", "shortlisted", "rejected", "hired"],
      default: "applied",
    },

    // ── AI Match Data ────────────────────────────────────────────────
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
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

    // ── AI Candidate Summary (for recruiter view) ────────────────────
    aiSummary: {
      type: String,
      default: "",
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },

    // ── AI Feedback (for job seeker after rejection) ─────────────────
    rejectionFeedback: {
      type: String,
      default: "",
    },
    improvementTips: {
      type: [String],
      default: [],
    },

    // ── Recruiter Note ───────────────────────────────────────────────
    recruiterNote: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

// Prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

const applicationModel = mongoose.model("Application", applicationSchema);

module.exports = applicationModel;
