import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import "../../../styles/auth.login.scss";

// ── Icons ──────────────────────────────────────────────────────────────────
const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.75",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

const IconMail = () => (
  <svg {...iconProps}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconLock = () => (
  <svg {...iconProps}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = () => (
  <svg {...iconProps}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg {...iconProps}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconArrow = () => (
  <svg {...iconProps} strokeWidth="2" width="16" height="16">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

// ── Role → redirect map (mirrors Protected.jsx) ────────────────────────────
const ROLE_HOME = {
  jobseeker: "/dashboard",
  recruiter: "/recruiter",
  admin: "/admin",
};

// What you can do once you are in
const HIGHLIGHTS = [
  ["Resume analysis", "A 23-point report against any job description."],
  ["Interview prep", "Questions, model answers and a weekly plan."],
  ["Candidate ranking", "Every applicant scored the moment they apply."],
];

// ── Main component ─────────────────────────────────────────────────────────
const Login = () => {
  const { loading, handleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await handleLogin({ email, password });

      // ── Role-based redirect (jobseeker | recruiter | admin) ──────
      const role = data?.user?.role;
      navigate(ROLE_HOME[role] ?? "/dashboard");
    } catch (err) {
      setError(err.message || "That email and password do not match. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="hb-root">
        <div className="hb-loading" role="status">
          <span className="hb-brand-name">HireBot</span>
          <div className="hb-spinner" />
          <p>Signing you in…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hb-root">
      {/* ── Left editorial panel ── */}
      <aside className="hb-left">
        <div className="hb-left-inner">
          <Link to="/" className="hb-brand" aria-label="HireBot home">
            <span className="hb-brand-name">HireBot</span>
          </Link>

          <div className="hb-hero">
            <h2 className="hb-headline">
              Pick up where your resume <em>left off.</em>
            </h2>
            <p className="hb-desc">
              Your analyses, interview kits and applications are waiting for you.
            </p>

            <ul className="hb-list">
              {HIGHLIGHTS.map(([title, desc]) => (
                <li className="hb-list-item" key={title}>
                  <span className="hb-list-title">{title}</span>
                  <span className="hb-list-desc">{desc}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="hb-note">
            Resumes are read in memory and never written to disk. AI scores
            support your decision. They do not replace it.
          </p>
        </div>
      </aside>

      {/* ── Right form panel ── */}
      <section className="hb-right">
        <div className="hb-card">
          {/* Mobile-only logo */}
          <Link to="/" className="hb-card-logo" aria-label="HireBot home">
            <span className="hb-brand-name">HireBot</span>
          </Link>

          <div className="hb-card-header">
            <h1 className="hb-card-title">Welcome back</h1>
            <p className="hb-card-sub">Sign in to continue where you stopped.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="hb-field">
              <label className="hb-label" htmlFor="email">
                Email address
              </label>
              <div className="hb-input-wrap">
                <span className="hb-input-icon">
                  <IconMail />
                </span>
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
              <div className="hb-label-row">
                <label className="hb-label" htmlFor="password">
                  Password
                </label>
                <Link to="/forgot-password" className="hb-link">
                  Forgot password?
                </Link>
              </div>
              <div className="hb-input-wrap">
                <span className="hb-input-icon">
                  <IconLock />
                </span>
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

            <div aria-live="polite">
              {error && <div className="hb-error">{error}</div>}
            </div>

            <button className="hb-btn-submit" type="submit" disabled={submitting}>
              {submitting ? (
                "Signing in…"
              ) : (
                <>
                  Sign in <IconArrow />
                </>
              )}
            </button>
          </form>

          <p className="hb-footer">
            New to HireBot? <Link to="/register">Create a free account</Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Login;