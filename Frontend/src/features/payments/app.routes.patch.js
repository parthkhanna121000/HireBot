/**
 * APP.ROUTES.JSX PATCH
 *
 * Add these imports and routes to your existing app.routes.jsx.
 * Find the matching section and insert.
 */

// ─── NEW IMPORTS ──────────────────────────────────────────────────────────────
/*
import PricingPage from "./features/payments/pages/PricingPage";
*/

// ─── ADD THIS ROUTE (public — no auth required) ───────────────────────────────
/*
<Route path="/pricing" element={<PricingPage />} />
*/

// ─── COMPLETE ROUTES FILE (for reference) ─────────────────────────────────────
/*
import { Routes, Route, Navigate } from "react-router-dom";
import Protected from "./features/auth/components/Protected";

import HirebotLanding     from "./features/landing/HirebotLanding";
import Login              from "./features/auth/pages/Login";
import Register           from "./features/auth/pages/Register";
import Dashboard          from "./features/dashboard/pages/Dashboard";
import ResumeAnalyzer     from "./features/resume/pages/ResumeAnalyzer";
import InterviewPrep      from "./features/interview/pages/InterviewPrep";
import InterviewHistory   from "./features/interview/pages/InterviewHistory";
import Jobs               from "./features/jobs/pages/Jobs";
import ApplicationTracker from "./features/applications/pages/ApplicationTracker";
import Settings           from "./features/settings/pages/Settings";
import RecruiterDashboard from "./features/recruiter/pages/RecruiterDashboard";
import PostJobForm        from "./features/recruiter/pages/PostJobForm";
import ApplicantsRanking  from "./features/recruiter/pages/ApplicantsRanking";

// ── NEW ──
import PricingPage        from "./features/payments/pages/PricingPage";

export default function AppRoutes() {
  return (
    <Routes>
      // Public
      <Route path="/"          element={<HirebotLanding />} />
      <Route path="/login"     element={<Login />} />
      <Route path="/register"  element={<Register />} />
      <Route path="/pricing"   element={<PricingPage />} />   // ← NEW

      // Jobseeker
      <Route path="/dashboard"         element={<Protected role="jobseeker"><Dashboard /></Protected>} />
      <Route path="/resume-analyzer"   element={<Protected role="jobseeker"><ResumeAnalyzer /></Protected>} />
      <Route path="/interview-prep"    element={<Protected role="jobseeker"><InterviewPrep /></Protected>} />
      <Route path="/interview-history" element={<Protected role="jobseeker"><InterviewHistory /></Protected>} />
      <Route path="/jobs"              element={<Protected role="jobseeker"><Jobs /></Protected>} />
      <Route path="/applications"      element={<Protected role="jobseeker"><ApplicationTracker /></Protected>} />
      <Route path="/settings"          element={<Protected><Settings /></Protected>} />

      // Recruiter
      <Route path="/recruiter"                    element={<Protected role="recruiter"><RecruiterDashboard /></Protected>} />
      <Route path="/recruiter/post-job"           element={<Protected role="recruiter"><PostJobForm /></Protected>} />
      <Route path="/recruiter/applicants/:id"     element={<Protected role="recruiter"><ApplicantsRanking /></Protected>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
*/
