const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: [true, "Username is required"],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },

    // ── Role ────────────────────────────────────────────────────────
    role: {
      type: String,
      enum: ["jobseeker", "recruiter", "admin"],
      default: "jobseeker",
    },

    // ── Job Seeker Profile ───────────────────────────────────────────
    skills: {
      type: [String],
      default: [],
    },
    experienceLevel: {
      type: String,
      enum: ["fresher", "junior", "mid", "senior", "lead"],
      default: "fresher",
    },
    bio: {
      type: String,
      default: "",
    },
    profilePhoto: {
      type: String, // URL or base64
      default: "",
    },

    // ── Recruiter Profile ────────────────────────────────────────────
    companyName: {
      type: String,
      default: "",
    },
    companyWebsite: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
