import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

/**
 * Protected — Role-aware route guard
 *
 * Usage:
 *   <Protected>                        — any logged-in user
 *   <Protected role="jobseeker">       — jobseekers only  → recruiter sent to /recruiter
 *   <Protected role="recruiter">       — recruiters only  → jobseeker sent to /dashboard
 *
 * Flow:
 *   1. Still loading auth  → show spinner (prevents flash-redirect)
 *   2. Not logged in       → /login
 *   3. Wrong role          → role's home route
 *   4. Correct role        → render children
 */

const ROLE_HOME = {
  jobseeker: "/dashboard",
  recruiter: "/recruiter",
  admin: "/admin",

};

const Protected = ({ children, role }) => {
  const { user, loading } = useAuth();

  // ── 1. Auth still resolving ─────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.root}>
        <div style={styles.logoMark}>H</div>
        <div style={styles.spinner} />
        <p style={styles.label}>Loading…</p>
      </div>
    );
  }

  // ── 2. Not authenticated ────────────────────────────────────────────────
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ── 3. Role mismatch ─────────────────────────────────────────────────────
  //    If a recruiter hits a jobseeker-only route → send to /recruiter
  //    If a jobseeker hits a recruiter-only route → send to /dashboard
  if (role && user.role !== role) {
    const redirect = ROLE_HOME[user.role] ?? "/login";
    return <Navigate to={redirect} replace />;
  }

  // ── 4. All checks passed ─────────────────────────────────────────────────
  return children;
};

// ── Inline styles (no SCSS dep — works standalone) ────────────────────────
const styles = {
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#0a0a0a",
    gap: "16px",
  },
  logoMark: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "linear-gradient(135deg, #00e5a0, #00b8ff)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    fontWeight: 700,
    color: "#0a0a0a",
    fontFamily: "Geist, sans-serif",
  },
  spinner: {
    width: 24,
    height: 24,
    border: "2px solid rgba(255,255,255,0.1)",
    borderTop: "2px solid #00e5a0",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  label: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
    fontFamily: "Geist, sans-serif",
    margin: 0,
  },
};

export default Protected;