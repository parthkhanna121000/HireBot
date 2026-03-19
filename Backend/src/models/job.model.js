const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    // ── Basic Info ───────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    companyWebsite: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "Remote",
    },

    // ── Job Details ──────────────────────────────────────────────────
    requiredSkills: {
      type: [String],
      default: [],
    },
    experienceLevel: {
      type: String,
      enum: ["fresher", "junior", "mid", "senior", "lead"],
      default: "junior",
    },
    salaryMin: {
      type: Number,
      default: 0,
    },
    salaryMax: {
      type: Number,
      default: 0,
    },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "remote"],
      default: "full-time",
    },

    // ── AI Enhanced Description ──────────────────────────────────────
    aiEnhancedDescription: {
      type: String,
      default: "",
    },
    aiSuggestedSkills: {
      type: [String],
      default: [],
    },

    // ── Status ───────────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Owner ────────────────────────────────────────────────────────
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Text index for search
jobSchema.index({ title: "text", description: "text", companyName: "text" });

const jobModel = mongoose.model("Job", jobSchema);

module.exports = jobModel;
