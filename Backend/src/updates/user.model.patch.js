/**
 * USER MODEL PATCH
 * Add these fields to your existing user.model.js
 * Merge them into the existing userSchema definition
 */

// ─── ADD THESE FIELDS TO YOUR EXISTING userSchema ────────────────────────────

const planFields = {
  plan: {
    type: String,
    enum: ["free", "pro"],
    default: "free",
  },

  subscriptionId: {
    type: String,
    default: null,
  },

  planStartDate: {
    type: Date,
    default: null,
  },

  planExpiryDate: {
    type: Date,
    default: null,
  },

  usage: {
    resumeAnalyses: { type: Number, default: 0 },
    interviewReports: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: Date.now },
  },
};

// ─── COMPLETE UPDATED userSchema EXAMPLE ─────────────────────────────────────
// Replace your existing schema definition with this:

/*
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username:    { type: String, required: true, unique: true, trim: true },
    email:       { type: String, required: true, unique: true, lowercase: true },
    password:    { type: String, required: true },
    role:        { type: String, enum: ["jobseeker", "recruiter"], required: true },

    // Jobseeker fields
    skills:         [String],
    experienceLevel: String,

    // Recruiter fields
    companyName:    String,
    companyWebsite: String,

    // ── PLAN & SUBSCRIPTION (NEW) ──
    plan: { type: String, enum: ["free", "pro"], default: "free" },
    subscriptionId:  { type: String, default: null },
    planStartDate:   { type: Date,   default: null },
    planExpiryDate:  { type: Date,   default: null },

    usage: {
      resumeAnalyses:   { type: Number, default: 0 },
      interviewReports: { type: Number, default: 0 },
      lastResetDate:    { type: Date,   default: Date.now },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
*/

export { planFields };
