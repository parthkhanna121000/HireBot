// const mongoose = require("mongoose");

// /**
//  * - Job description schema: string
//  * - Resume text: string
//  * - Self description: string
//  *
//  * - Technical question: [{
//  *     question: "",
//  *     intention: "",
//  *     answer: "",
//  * }]
//  *
//  * - Behavioral question: [{
//  *     question: "",
//  *     intention: "",
//  *     answer: "",
//  * }]
//  *
//  * - Skill gaps: [{
//  *     skill: "",
//  *     severity: "",
//  *     enum: ["low", "medium", "high"],
//  * }]
//  *
//  * - Preparation plan: [{
//  *     day: number,
//  *     focus: string,
//  *     tasks: [string]
//  * }]
//  */

// // Technical questions schema
// const technicalQuestionSchema = new mongoose.Schema(
//   {
//     question: {
//       type: String,
//       required: [true, "Technical question is required"],
//     },
//     intention: {
//       type: String,
//       required: [true, "Intention is required"],
//     },
//     answer: {
//       type: String,
//       required: [true, "Answer is required"],
//     },
//   },
//   { _id: false },
// );

// // Behavioral questions schema
// const behavioralQuestionSchema = new mongoose.Schema(
//   {
//     question: {
//       type: String,
//       required: [true, "Behavioral question is required"], // Fixed error message
//     },
//     intention: {
//       type: String,
//       required: [true, "Intention is required"],
//     },
//     answer: {
//       type: String,
//       required: [true, "Answer is required"],
//     },
//   },
//   { _id: false },
// );

// // Skill gaps schema
// const skillGapSchema = new mongoose.Schema(
//   {
//     skill: {
//       type: String,
//       required: [true, "Skill is required"],
//     },
//     severity: {
//       type: String,
//       enum: ["low", "medium", "high"],
//       required: [true, "Severity is required"],
//     },
//   },
//   { _id: false },
// );

// // Preparation plan schema
// const preparationPlanSchema = new mongoose.Schema({
//   day: {
//     type: Number,
//     required: [true, "Day is required"],
//   },
//   focus: {
//     type: String,
//     required: [true, "Focus is required"],
//   },
//   tasks: {
//     type: [String],
//     required: true,
//     validate: {
//       validator: (arr) => arr.length > 0,
//       message: "At least one task is required",
//     },
//   },
// });

// // Main Interview Report schema
// const interviewReportSchema = new mongoose.Schema(
//   {
//     jobDescription: {
//       type: String,
//       required: [true, "Job description is required"],
//     },
//     resume: {
//       type: String, // extracted from PDF
//     },
//     selfDescription: {
//       type: String,
//     },
//     matchScore: {
//       type: Number,
//       min: 0,
//       max: 100,
//     },
//     technicalQuestions: [technicalQuestionSchema],
//     behavioralQuestions: [behavioralQuestionSchema],
//     skillGaps: [skillGapSchema],
//     preparationPlan: [preparationPlanSchema],
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "users",
//       required: true, // ensure each report is linked to a user
//     },
//     title: {
//       type: String,
//       required: [true, "Job title is required"], // must send this in POST
//     },
//   },
//   { timestamps: true },
// );

// const interviewReportModel = mongoose.model(
//   "InterviewReport",
//   interviewReportSchema,
// );

// module.exports = interviewReportModel;

// const mongoose = require("mongoose");

// ─── Sub-schemas ──────────────────────────────────────────────────────────────
//
// WHY required was removed:
// Gemini 2.5 Flash-Lite sometimes returns technicalQuestions as plain strings
// ("What is Node.js?") instead of objects ({question, intention, answer}).
// Our sanitizer in the controller converts strings → objects but fills intention
// and answer with "". Mongoose then rejects them because required: true fails
// on an empty string. The fix: make intention and answer optional with defaults.
// The controller sanitizer already ensures the correct shape reaches Mongoose.

// const technicalQuestionSchema = new mongoose.Schema(
//   {
//     question: { type: String, default: "" },
//     intention: { type: String, default: "" }, // ← was required, now optional
//     answer: { type: String, default: "" }, // ← was required, now optional
//   },
//   { _id: false },
// );

// const behavioralQuestionSchema = new mongoose.Schema(
//   {
//     question: { type: String, default: "" },
//     intention: { type: String, default: "" }, // ← was required, now optional
//     answer: { type: String, default: "" }, // ← was required, now optional
//   },
//   { _id: false },
// );

// const skillGapSchema = new mongoose.Schema(
//   {
//     skill: {
//       type: String,
//       required: [true, "Skill is required"],
//     },
//     severity: {
//       type: String,
//       enum: ["low", "medium", "high"],
//       default: "medium", // ← was required, now has a safe default
//     },
//   },
//   { _id: false },
// );

// const preparationPlanSchema = new mongoose.Schema(
//   {
//     day: {
//       type: Number,
//       required: [true, "Day is required"],
//     },
//     focus: {
//       type: String,
//       default: "",
//     },
//     tasks: {
//       type: [String],
//       default: [], // ← validate removed; empty array is fine
//     },
//   },
//   { _id: false },
// );

// // ─── Main Interview Report schema ─────────────────────────────────────────────
// const interviewReportSchema = new mongoose.Schema(
//   {
//     jobDescription: {
//       type: String,
//       required: [true, "Job description is required"],
//     },
//     resume: { type: String, default: "" },
//     selfDescription: { type: String, default: "" },
//     matchScore: { type: Number, min: 0, max: 100, default: 0 },

//     technicalQuestions: [technicalQuestionSchema],
//     behavioralQuestions: [behavioralQuestionSchema],
//     skillGaps: [skillGapSchema],
//     preparationPlan: [preparationPlanSchema],

//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     title: {
//       type: String,
//       required: [true, "Job title is required"],
//     },
//   },
//   { timestamps: true },
// );

// const interviewReportModel = mongoose.model(
//   "InterviewReport",
//   interviewReportSchema,
// );

// module.exports = interviewReportModel;
const mongoose = require("mongoose");

// ─── Question sub-schema (now includes difficulty + keyPoints) ─────────────────
const questionSchema = new mongoose.Schema(
  {
    question: { type: String, default: "" },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    intention: { type: String, default: "" },
    answer: { type: String, default: "" },
    keyPoints: { type: [String], default: [] },
  },
  { _id: false },
);

const skillGapSchema = new mongoose.Schema(
  {
    skill: { type: String, default: "" },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  { _id: false },
);

const preparationPlanSchema = new mongoose.Schema(
  {
    day: { type: Number, default: 1 },
    focus: { type: String, default: "" },
    tasks: { type: [String], default: [] },
  },
  { _id: false },
);

// ─── Main schema ──────────────────────────────────────────────────────────────
const interviewReportSchema = new mongoose.Schema(
  {
    jobDescription: {
      type: String,
      required: [true, "Job description is required"],
    },
    resume: { type: String, default: "" },
    selfDescription: { type: String, default: "" },
    matchScore: { type: Number, min: 0, max: 100, default: 0 },
    technicalQuestions: [questionSchema],
    behavioralQuestions: [questionSchema],
    skillGaps: [skillGapSchema],
    preparationPlan: [preparationPlanSchema],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: [true, "Job title is required"] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("InterviewReport", interviewReportSchema);
