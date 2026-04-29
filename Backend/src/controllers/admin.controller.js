const User = require("../models/user.model");
const Resume = require("../models/resume.model");
const InterviewReport = require("../models/interviewReport.model");
const Job = require("../models/job.model");
const Application = require("../models/application.model");
const Notification = require("../models/notification.model");

// GET /api/admin/stats
const getAdminStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // ── User stats ────────────────────────────────────────────────────────────
    const totalUsers = await User.countDocuments();
    const proUsers = await User.countDocuments({ plan: "pro" });
    const freeUsers = await User.countDocuments({ plan: "free" });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth },
    });
    const newUsersLastMonth = await User.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });

    // Pro monthly vs annual split
    const proMonthly = await User.countDocuments({
      plan: "pro",
      subscriptionId: { $regex: /monthly/i },
    });
    const proAnnual = proUsers - proMonthly;

    // Churned = was pro, now free, planExpiryDate in past
    const churned = await User.countDocuments({
      plan: "free",
      planExpiryDate: { $lt: now, $gte: startOfLastMonth },
    });
    const churnRate =
      proUsers > 0
        ? ((churned / (proUsers + churned)) * 100).toFixed(1)
        : "0.0";

    // Free → Pro conversion rate (this month)
    const convRate =
      newUsersThisMonth > 0
        ? (
            ((await User.countDocuments({
              plan: "pro",
              planStartDate: { $gte: startOfMonth },
            })) /
              newUsersThisMonth) *
            100
          ).toFixed(1)
        : "0.0";

    // ── MRR calculation ───────────────────────────────────────────────────────
    // Rs 499/month monthly plan, Rs 333/month effective for annual (3999/12)
    const monthlyRevenue = proMonthly * 499;
    const annualRevenue = proAnnual * 333;
    const mrr = monthlyRevenue + annualRevenue;

    // MRR trend — last 8 months (approximate from user planStartDate)
    const mrrTrend = await Promise.all(
      Array.from({ length: 8 }, (_, i) => {
        const monthStart = new Date(
          now.getFullYear(),
          now.getMonth() - (7 - i),
          1,
        );
        const monthEnd = new Date(
          now.getFullYear(),
          now.getMonth() - (7 - i) + 1,
          0,
        );
        return User.countDocuments({
          plan: "pro",
          planStartDate: { $lte: monthEnd },
          $or: [
            { planExpiryDate: { $gte: monthStart } },
            { planExpiryDate: null },
          ],
        }).then((count) => ({
          month: monthStart.toLocaleString("default", { month: "short" }),
          mrr: Math.round(count * 416),
          newSubs: 0,
        }));
      }),
    );

    // New subs per month for trend
    for (let i = 0; i < 8; i++) {
      const monthStart = new Date(
        now.getFullYear(),
        now.getMonth() - (7 - i),
        1,
      );
      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() - (7 - i) + 1,
        0,
      );
      mrrTrend[i].newSubs = await User.countDocuments({
        plan: "pro",
        planStartDate: { $gte: monthStart, $lte: monthEnd },
      });
    }

    // ── Feature usage (last 30 days) ──────────────────────────────────────────
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const resumeAnalyses = await Resume.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });
    const interviewReports = await InterviewReport.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });
    const jobApplications = await Application.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });
    const bulletRewrites = await Resume.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: null,
          total: { $sum: { $size: { $ifNull: ["$bulletRewrites", []] } } },
        },
      },
    ]).then((r) => r[0]?.total || 0);
    const pdfExports = await Resume.countDocuments({
      pdfGenerated: true,
      updatedAt: { $gte: thirtyDaysAgo },
    });
    const jobsPosted = await Job.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });
    const candidateRankings = await Application.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          matchScore: { $exists: true },
        },
      },
      { $count: "total" },
    ]).then((r) => r[0]?.total || 0);

    const featureUsage = [
      { name: "Resume analysis", count: resumeAnalyses, icon: "resume" },
      { name: "Interview prep", count: interviewReports, icon: "interview" },
      { name: "Job applications", count: jobApplications, icon: "apply" },
      { name: "Candidate ranking", count: candidateRankings, icon: "rank" },
      { name: "PDF exports", count: pdfExports, icon: "pdf" },
      { name: "AI bullet rewrite", count: bulletRewrites, icon: "rewrite" },
      { name: "Jobs posted", count: jobsPosted, icon: "job" },
    ].sort((a, b) => b.count - a.count);

    // ── Onboarding funnel ─────────────────────────────────────────────────────
    const registeredTotal = totalUsers;
    const uploadedResume = await Resume.distinct("user").then(
      (ids) => ids.length,
    );
    const ranAnalysis = await Resume.countDocuments({
      overallScore: { $exists: true },
    })
      .then(() => Resume.distinct("user"))
      .then((ids) => ids.length);
    const appliedToJob = await Application.distinct("applicant").then(
      (ids) => ids.length,
    );
    const upgradedToPro = proUsers;

    const onboardingFunnel = [
      { step: "Registered account", count: registeredTotal, pct: 100 },
      {
        step: "Uploaded first resume",
        count: uploadedResume,
        pct: registeredTotal
          ? Math.round((uploadedResume / registeredTotal) * 100)
          : 0,
      },
      {
        step: "Ran resume analysis",
        count: ranAnalysis,
        pct: registeredTotal
          ? Math.round((ranAnalysis / registeredTotal) * 100)
          : 0,
      },
      {
        step: "Applied to a job",
        count: appliedToJob,
        pct: registeredTotal
          ? Math.round((appliedToJob / registeredTotal) * 100)
          : 0,
      },
      {
        step: "Upgraded to Pro",
        count: upgradedToPro,
        pct: registeredTotal
          ? Math.round((upgradedToPro / registeredTotal) * 100)
          : 0,
      },
    ];

    // ── Application pipeline stats ────────────────────────────────────────────
    const totalApplications = await Application.countDocuments();
    const shortlisted = await Application.countDocuments({
      status: "shortlisted",
    });
    const rejected = await Application.countDocuments({ status: "rejected" });
    const interviewScheduled = await Application.countDocuments({
      status: "interview",
    });
    const avgMatchScore = await Application.aggregate([
      { $group: { _id: null, avg: { $avg: "$matchScore" } } },
    ]).then((r) => Math.round(r[0]?.avg || 0));

    // ── Recent pro upgrades ───────────────────────────────────────────────────
    const recentUpgrades = await User.find({ plan: "pro" })
      .sort({ planStartDate: -1 })
      .limit(6)
      .select("username email planStartDate subscriptionId");

    // ── Active jobs ───────────────────────────────────────────────────────────
    const activeJobs = await Job.countDocuments({ isActive: true });
    const totalJobs = await Job.countDocuments();

    // ── Notifications sent ────────────────────────────────────────────────────
    const notificationsSent = await Notification.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // ── User growth trend ─────────────────────────────────────────────────────
    const userGrowthTrend = await Promise.all(
      Array.from({ length: 8 }, (_, i) => {
        const monthStart = new Date(
          now.getFullYear(),
          now.getMonth() - (7 - i),
          1,
        );
        const monthEnd = new Date(
          now.getFullYear(),
          now.getMonth() - (7 - i) + 1,
          0,
        );
        return User.countDocuments({
          createdAt: { $gte: monthStart, $lte: monthEnd },
        }).then((count) => ({
          month: monthStart.toLocaleString("default", { month: "short" }),
          newUsers: count,
        }));
      }),
    );

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          proUsers,
          freeUsers,
          newUsersThisMonth,
          newUsersLastMonth,
          proMonthly,
          proAnnual,
          churnRate: parseFloat(churnRate),
          convRate: parseFloat(convRate),
          mrr,
          activeJobs,
          totalJobs,
          notificationsSent,
          avgMatchScore,
        },
        mrrTrend,
        userGrowthTrend,
        featureUsage,
        onboardingFunnel,
        applicationPipeline: {
          total: totalApplications,
          shortlisted,
          rejected,
          interviewScheduled,
          pending:
            totalApplications - shortlisted - rejected - interviewScheduled,
          avgMatchScore,
        },
        planDistribution: {
          free: freeUsers,
          proMonthly,
          proAnnual,
        },
        recentUpgrades,
      },
    });
  } catch (err) {
    console.error("[admin.controller] getAdminStats error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch admin stats" });
  }
};

module.exports = { getAdminStats };
