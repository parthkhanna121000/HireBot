const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

// ─── Helper ───────────────────────────────────────────────────────────────────
function signToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

function setCookieAndRespond(res, statusCode, user, message) {
  const token = signToken(user);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  return res.status(statusCode).json({
    message,
    user: formatUser(user),
  });
}

function formatUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    skills: user.skills,
    experienceLevel: user.experienceLevel,
    bio: user.bio,
    profilePhoto: user.profilePhoto,
    companyName: user.companyName,
    companyWebsite: user.companyWebsite,
  };
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (jobseeker or recruiter)
 * @access  Public
 */
async function registerUserController(req, res) {
  try {
    const {
      username,
      email,
      password,
      role,
      // job seeker fields
      skills,
      experienceLevel,
      // recruiter fields
      companyName,
      companyWebsite,
    } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Please provide username, email and password",
      });
    }

    const isUserAlreadyExists = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isUserAlreadyExists) {
      return res.status(400).json({
        message: "Account already exists with this email or username",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const userData = {
      username,
      email,
      password: hash,
      role: role || "jobseeker",
    };

    // Add role-specific fields
    if (userData.role === "jobseeker") {
      if (skills) userData.skills = skills;
      if (experienceLevel) userData.experienceLevel = experienceLevel;
    } else if (userData.role === "recruiter") {
      if (companyName) userData.companyName = companyName;
      if (companyWebsite) userData.companyWebsite = companyWebsite;
    }

    const user = await userModel.create(userData);
    return setCookieAndRespond(res, 201, user, "User registered successfully");
  } catch (error) {
    console.error("Register error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   POST /api/auth/login
 * @desc    Login user with email and password
 * @access  Public
 */
async function loginUserController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    return setCookieAndRespond(res, 200, user, "User logged in successfully");
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   GET /api/auth/logout
 * @desc    Logout user — blacklist token and clear cookie
 * @access  Private
 */
async function logoutUserController(req, res) {
  try {
    const token = req.cookies.token;
    if (token) {
      await tokenBlacklistModel.create({ token });
    }
    res.clearCookie("token");
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user details
 * @access  Private
 */
async function getMeController(req, res) {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      message: "User details fetched successfully",
      user: formatUser(user),
    });
  } catch (error) {
    console.error("GetMe error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile (skills, bio, company info etc.)
 * @access  Private
 */
async function updateProfileController(req, res) {
  try {
    const {
      username,
      skills,
      experienceLevel,
      bio,
      profilePhoto,
      companyName,
      companyWebsite,
    } = req.body;

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update only provided fields
    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;

    if (user.role === "jobseeker") {
      if (skills) user.skills = skills;
      if (experienceLevel) user.experienceLevel = experienceLevel;
    } else if (user.role === "recruiter") {
      if (companyName) user.companyName = companyName;
      if (companyWebsite) user.companyWebsite = companyWebsite;
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: formatUser(user),
    });
  } catch (error) {
    console.error("UpdateProfile error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
async function changePasswordController(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Please provide current and new password" });
    }

    const user = await userModel.findById(req.user.id);
    const isValid = await bcrypt.compare(currentPassword, user.password);

    if (!isValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("ChangePassword error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

module.exports = {
  registerUserController,
  loginUserController,
  logoutUserController,
  getMeController,
  updateProfileController,
  changePasswordController,
};
