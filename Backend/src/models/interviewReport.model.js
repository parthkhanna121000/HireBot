const mongoose = require("mongoose");

/**
 * - Job description schema: string
 * - Resume text: string
 * - Self description: string
 *
 * - Technical question: [{
 *     question: "",
 *     intention: "",
 *     answer: "",
 * }]
 *
 * - Behavioral question: [{
 *     question: "",
 *     intention: "",
 *     answer: "",
 * }]
 *
 * - Skill gaps: [{
 *     skill: "",
 *     severity: "",
 *     enum: ["low", "medium", "high"],
 * }]
 *
 * - Preparation plan: [{
 *     day: number,
 *     focus: string,
 *     tasks: [string]
 * }]
 */

// Technical questions schema
const technicalQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Technical question is required"],
    },
    intention: {
      type: String,
      required: [true, "Intention is required"],
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
    },
  },
  { _id: false },
);

// Behavioral questions schema
const behavioralQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Behavioral question is required"], // Fixed error message
    },
    intention: {
      type: String,
      required: [true, "Intention is required"],
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
    },
  },
  { _id: false },
);

// Skill gaps schema
const skillGapSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      required: [true, "Skill is required"],
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      required: [true, "Severity is required"],
    },
  },
  { _id: false },
);

// Preparation plan schema
const preparationPlanSchema = new mongoose.Schema({
  day: {
    type: Number,
    required: [true, "Day is required"],
  },
  focus: {
    type: String,
    required: [true, "Focus is required"],
  },
  tasks: {
    type: [String],
    required: true,
    validate: {
      validator: (arr) => arr.length > 0,
      message: "At least one task is required",
    },
  },
});

// Main Interview Report schema
const interviewReportSchema = new mongoose.Schema(
  {
    jobDescription: {
      type: String,
      required: [true, "Job description is required"],
    },
    resume: {
      type: String, // extracted from PDF
    },
    selfDescription: {
      type: String,
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    technicalQuestions: [technicalQuestionSchema],
    behavioralQuestions: [behavioralQuestionSchema],
    skillGaps: [skillGapSchema],
    preparationPlan: [preparationPlanSchema],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true, // ensure each report is linked to a user
    },
    title: {
      type: String,
      required: [true, "Job title is required"], // must send this in POST
    },
  },
  { timestamps: true },
);

const interviewReportModel = mongoose.model(
  "InterviewReport",
  interviewReportSchema,
);

module.exports = interviewReportModel;
