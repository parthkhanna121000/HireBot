import React, { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router";
import "../../../styles/auth.login.scss";

// ── Icons ──────────────────────────────────────────────────────────────────
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const GoogleLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

// ── Sub-components ─────────────────────────────────────────────────────────
const StatCard = ({ value, label, delay }) => (
  <div className="hb-stat" style={{ animationDelay: delay }}>
    <span className="hb-stat-value">{value}</span>
    <span className="hb-stat-label">{label}</span>
  </div>
);

const FeaturePill = ({ icon, text, delay }) => (
  <div className="hb-pill" style={{ animationDelay: delay }}>
    <span className="hb-pill-icon">{icon}</span>
    {text}
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────
const Login = () => {
  const { loading, handleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      await handleLogin({ email, password });
      navigate("/");
    } catch {
      setError("Invalid email or password. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="hb-root">
        <div className="hb-loading">
          <div className="hb-logo-mark">H</div>
          <div className="hb-spinner" />
          <p>Signing you in…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hb-root">

      {/* ── Left branding panel ── */}
      <aside className="hb-left">
        <div className="hb-left-inner">

          <div className="hb-brand">
            <div className="hb-logo-mark">H</div>
            <span className="hb-brand-name">HireBot</span>
          </div>

          <div className="hb-hero">
            <span className="hb-eyebrow">AI-Powered Hiring</span>

            <h2 className="hb-headline">
              Land your <em>dream job</em> faster than ever
            </h2>

            <p className="hb-desc">
              HireBot analyzes your resume, matches you to roles, and gives
              you the edge with AI-powered coaching.
            </p>

            <div className="hb-pills">
              <FeaturePill icon="✦" text="Smart resume analysis & scoring" delay="0.30s" />
              <FeaturePill icon="◈" text="Real-time ATS keyword matching"  delay="0.38s" />
              <FeaturePill icon="⬡" text="AI bullet point rewriter"        delay="0.46s" />
            </div>
          </div>

          <div className="hb-stats">
            <StatCard value="50K+" label="Resumes analyzed"  delay="0.40s" />
            <StatCard value="3.2×" label="More interviews"   delay="0.46s" />
            <StatCard value="94%"  label="Satisfaction rate" delay="0.52s" />
          </div>

        </div>
      </aside>

      {/* ── Right form panel ── */}
      <section className="hb-right">
        <div className="hb-card">

          {/* Mobile-only logo */}
          <div className="hb-card-logo">
            <div className="hb-logo-mark">H</div>
            <span className="hb-brand-name">HireBot</span>
          </div>

          <div className="hb-card-header">
            <h1 className="hb-card-title">Welcome back</h1>
            <p className="hb-card-sub">Sign in to continue your hiring journey</p>
          </div>

          <button className="hb-btn-google" type="button">
            <GoogleLogo />
            Continue with Google
          </button>

          <div className="hb-divider">or sign in with email</div>

          <form onSubmit={handleSubmit}>

            <div className="hb-field">
              <label className="hb-label" htmlFor="email">Email address</label>
              <div className="hb-input-wrap">
                <span className="hb-input-icon"><IconMail /></span>
                <input
                  id="email"
                  className="hb-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="hb-field">
              <label className="hb-label" htmlFor="password">Password</label>
              <div className="hb-input-wrap">
                <span className="hb-input-icon"><IconLock /></span>
                <input
                  id="password"
                  className="hb-input has-action"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="hb-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            <div className="hb-row">
              <Link to="/forgot-password" className="hb-link">Forgot password?</Link>
            </div>

            {error && <div className="hb-error">{error}</div>}

            <button className="hb-btn-submit" type="submit" disabled={loading}>
              {loading ? "Signing in…" : <> Sign in <IconArrow /> </>}
            </button>

          </form>

          <p className="hb-footer">
            No account?{" "}
            <Link to="/register">Create one free →</Link>
          </p>

        </div>
      </section>

    </div>
  );
};

export default Login;