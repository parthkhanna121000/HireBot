
import { createBrowserRouter } from "react-router";
 
// ── Landing ───────────────────────────────────────────────────────────────────
import HirebotLanding from "./features/landing/HirebotLanding";
 
// ── Auth ──────────────────────────────────────────────────────────────────────
import Login     from "./features/auth/pages/Login";
import Register  from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";
 
// ── Resume ────────────────────────────────────────────────────────────────────
import ResumeAnalyzer from "./features/resume/pages/ResumeAnalyzer";
 
// ── Interview ─────────────────────────────────────────────────────────────────
import InterviewPrep    from "./features/interview/pages/InterviewPrep";
import InterviewHistory from "./features/interview/pages/InterviewHistory";

// ── Applications ─────────────────────────────────────────────────────────────
import ApplicationTracker from "./features/applications/pages/ApplicationTracker";
import ApplicantsRanking  from "./features/recruiter/pages/ApplicantsRanking";


// Admin
import AdminDashboard from './features/admin/pages/AdminDashboard';
 
// ── Dashboard ────────────────────────────────────────────────────────────────
import Dashboard from "./features/dashboard/pages/Dashboard";
 
// ── Jobs ──────────────────────────────────────────────────────────────────────
import Jobs from "./features/jobs/pages/Jobs";
 
// ── Recruiter ─────────────────────────────────────────────────────────────────
import RecruiterDashboard from "./features/recruiter/pages/RecruiterDashboard";
import PostJobForm        from "./features/recruiter/pages/PostJobForm";

// ── Settings ──────────────────────────────────────────────────────────────────
import Settings from "./features/dashboard/pages/Settings";

// ── Pricing ───────────────────────────────────────────────────────────────────
import PricingPage from "./features/payments/pages/PricingPage";

import ForgotResetPassword from "./features/auth/pages/ForgotResetPassword";

// ─── 404 ──────────────────────────────────────────────────────────────────────
function NotFound() {
  return (
    <div style={{
      minHeight: "100vh", background: "#08080f",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 12, color: "#e8e8f5",
      fontFamily: "DM Sans, sans-serif",
    }}>
      <div style={{ fontSize: 64, fontWeight: 800, color: "#44445a" }}>404</div>
      <p style={{ color: "#44445a", fontSize: 14, margin: 0 }}>Page not found</p>
      <a href="/" style={{ color: "#6366f1", textDecoration: "none", fontSize: 13 }}>
        ← Go home
      </a>
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────
//
//  Role enforcement rules:
//    <Protected role="jobseeker">  — jobseeker only → recruiter bounced to /recruiter
//    <Protected role="recruiter">  — recruiter only → jobseeker bounced to /dashboard
//    <Protected>                   — any logged-in user (no role restriction)
//
export const router = createBrowserRouter([

  // ── Public ──────────────────────────────────────────────────────────────────
  { path: "/",         element: <HirebotLanding /> },
  { path: "/login",    element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/pricing",  element: <PricingPage /> },   // ← NEW (public — no auth required)

  // ── Job Seeker only routes ───────────────────────────────────────────────────

  {
    path: "/dashboard",
    element: <Protected role="jobseeker"><Dashboard /></Protected>,
  },
  {
    path: "/resume-analyzer",
    element: <Protected role="jobseeker"><ResumeAnalyzer /></Protected>,
  },
  {
    path: "/interview-prep",
    element: <Protected role="jobseeker"><InterviewPrep /></Protected>,
  },
  {
    path: "/interview-history",
    element: <Protected role="jobseeker"><InterviewHistory /></Protected>,
  },
  {
    path: "/jobs",
    element: <Protected role="jobseeker"><Jobs /></Protected>,
  },
  {
    path: "/applications",
    element: <Protected role="jobseeker"><ApplicationTracker /></Protected>,
  },
  {
    path: "/settings",
    element: <Protected role="jobseeker"><Settings /></Protected>,
  },

  // ── Recruiter only routes ────────────────────────────────────────────────────

  {
    path: "/recruiter",
    element: <Protected role="recruiter"><RecruiterDashboard /></Protected>,
  },
  {
    path: "/recruiter/post-job",
    element: <Protected role="recruiter"><PostJobForm /></Protected>,
  },
  {
    path: "/recruiter/applicants/:jobId",
    element: <Protected role="recruiter"><ApplicantsRanking /></Protected>,
  },
  {
    path: "/admin",
    element: <Protected role="admin"><AdminDashboard  /></Protected>,
  },



{ path: "/forgot-password", element: <ForgotResetPassword /> },
{ path: "/reset-password",  element: <ForgotResetPassword /> },
  // <Route
//   path="/admin"
//   element={
//     <Protected role="admin">
//       <AdminDashboard />
//     </Protected>
//   }
// />

  // ── 404 ───────────────────────────────────────────────────────────────────────
  { path: "*", element: <NotFound /> },
]);