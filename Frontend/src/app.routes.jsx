import { createBrowserRouter } from "react-router";

// ── Landing ──────────────────────────────────────────────────────
import HirebotLanding from "./features/landing/HirebotLanding";

// ── Auth ─────────────────────────────────────────────────────────
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";

// ── Recruiter ────────────────────────────────────────────────────
import RecruiterDashboard from "./features/recruiter/pages/RecruiterDashboard";

// ── Resume ───────────────────────────────────────────────────────
import ResumeAnalyzer from "./features/resume/pages/ResumeAnalyzer";

// ── Coming soon (uncomment as you build each page) ───────────────
// import JobSeekerDashboard from "./features/jobseeker/pages/JobSeekerDashboard";
// import JobListings        from "./features/jobs/pages/JobListings";
// import JobDetails         from "./features/jobs/pages/JobDetails";
// import ApplicationTracker from "./features/jobseeker/pages/ApplicationTracker";
// import PostJob            from "./features/recruiter/pages/PostJob";
// import Applicants         from "./features/recruiter/pages/Applicants";

export const router = createBrowserRouter([

    // ── Public routes ─────────────────────────────────────────
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/register",
        element: <Register />,
    },

    // ── Public: Landing ───────────────────────────────────────
    {
        path: "/",
        element: <HirebotLanding />,
    },

    // ── Protected: Job Seeker ─────────────────────────────────
    {
        path: "/dashboard",
        element: <Protected><h1>Job Seeker Dashboard — coming soon</h1></Protected>,
    },
    // {
    //     path: "/dashboard",
    //     element: <Protected><JobSeekerDashboard /></Protected>,
    // },
    {
        path: "/resume-analyzer",
        element: <Protected><ResumeAnalyzer /></Protected>,
    },
    // {
    //     path: "/jobs",
    //     element: <Protected><JobListings /></Protected>,
    // },
    // {
    //     path: "/jobs/:jobId",
    //     element: <Protected><JobDetails /></Protected>,
    // },
    // {
    //     path: "/applications",
    //     element: <Protected><ApplicationTracker /></Protected>,
    // },

    // ── Protected: Recruiter ──────────────────────────────────
    {
        path: "/recruiter",
        element: <Protected><RecruiterDashboard /></Protected>,
    },
    // {
    //     path: "/recruiter/post-job",
    //     element: <Protected><PostJob /></Protected>,
    // },
    // {
    //     path: "/recruiter/applicants/:jobId",
    //     element: <Protected><Applicants /></Protected>,
    // },

])