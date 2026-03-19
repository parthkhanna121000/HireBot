import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import "../../../styles/auth.register.scss";

// ── Icons ──────────────────────────────────────────────────────────────────
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

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

// ── Password strength helper ───────────────────────────────────────────────
const getStrength = (pw) => {
  if (!pw) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "Too short", color: "#ef4444" },
    { label: "Weak",      color: "#f97316" },
    { label: "Fair",      color: "#eab308" },
    { label: "Good",      color: "#22c55e" },
    { label: "Strong",    color: "#16a34a" },
  ];
  return { score, ...map[score] };
};

// ── Left panel sub-components ─────────────────────────────────────────────
const Step = ({ num, title, desc, delay }) => (
  <div className="hb-reg-step" style={{ animationDelay: delay }}>
    <div className="hb-reg-step-num">{num}</div>
    <div className="hb-reg-step-body">
      <div className="hb-reg-step-title">{title}</div>
      <div className="hb-reg-step-desc">{desc}</div>
    </div>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────
const Register = () => {
  const navigate = useNavigate();
  const { loading, handleRegister } = useAuth();

  const [role, setRole]               = useState("jobseeker");
  const [username, setUsername]       = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState("");

  const strength = getStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      await handleRegister({ username, email, password, role });
      navigate("/");
    } catch {
      setError("Registration failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="hb-reg-root">
        <div className="hb-reg-loading">
          <div className="hb-reg-logo-mark">H</div>
          <div className="hb-reg-spinner" />
          <p>Creating your account…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hb-reg-root">

      {/* ── Left branding panel ── */}
      <aside className="hb-reg-left">
        <div className="hb-reg-left-inner">

          <div className="hb-reg-brand">
            <div className="hb-reg-logo-mark">H</div>
            <span className="hb-reg-brand-name">HireBot</span>
          </div>

          <div className="hb-reg-hero">
            <span className="hb-reg-eyebrow">Get started free</span>

            <h2 className="hb-reg-headline">
              Your career <em>upgrade</em> starts here
            </h2>

            <p className="hb-reg-desc">
              Join thousands of professionals using HireBot to land better
              roles, faster — with AI that actually understands your goals.
            </p>

            <div className="hb-reg-steps">
              <Step
                num="1" delay="0.28s"
                title="Upload your resume"
                desc="Drop in any format — PDF, DOC, or DOCX"
              />
              <Step
                num="2" delay="0.36s"
                title="Get your AI match score"
                desc="See exactly how you stack up against any job"
              />
              <Step
                num="3" delay="0.44s"
                title="Fix gaps & apply with confidence"
                desc="Use AI suggestions to stand out from the crowd"
              />
            </div>
          </div>

          <div className="hb-reg-testimonial">
            <p className="hb-reg-quote">
              Got 3 interviews in my first week after using HireBot to rewrite
              my resume. The AI suggestions were spot on.
            </p>
            <div className="hb-reg-author">
              <div className="hb-reg-avatar">SR</div>
              <div className="hb-reg-author-info">
                <span className="hb-reg-author-name">Sahil Rao</span>
                <span className="hb-reg-author-role">Frontend Engineer · Hired at Razorpay</span>
              </div>
            </div>
          </div>

        </div>
      </aside>

      {/* ── Right form panel ── */}
      <section className="hb-reg-right">
        <div className="hb-reg-card">

          {/* Mobile-only logo */}
          <div className="hb-reg-card-logo">
            <div className="hb-reg-logo-mark">H</div>
            <span className="hb-reg-brand-name">HireBot</span>
          </div>

          <div className="hb-reg-card-header">
            <h1 className="hb-reg-card-title">Create account</h1>
            <p className="hb-reg-card-sub">Start your AI-powered hiring journey</p>
          </div>

          {/* Role selector */}
          <div className="hb-reg-roles">
            <div
              className={`hb-reg-role ${role === "jobseeker" ? "active" : ""}`}
              onClick={() => setRole("jobseeker")}
            >
              <div className="hb-reg-role-check" />
              <span className="hb-reg-role-icon">🎯</span>
              <span className="hb-reg-role-label">Job Seeker</span>
            </div>
            <div
              className={`hb-reg-role ${role === "recruiter" ? "active" : ""}`}
              onClick={() => setRole("recruiter")}
            >
              <div className="hb-reg-role-check" />
              <span className="hb-reg-role-icon">🏢</span>
              <span className="hb-reg-role-label">Recruiter</span>
            </div>
          </div>

          {/* Google */}
          <button className="hb-reg-btn-google" type="button">
            <GoogleLogo />
            Continue with Google
          </button>

          <div className="hb-reg-divider">or register with email</div>

          {/* Form */}
          <form onSubmit={handleSubmit}>

            <div className="hb-reg-field">
              <label className="hb-reg-label" htmlFor="username">Username</label>
              <div className="hb-reg-input-wrap">
                <span className="hb-reg-input-icon"><IconUser /></span>
                <input
                  id="username"
                  className="hb-reg-input"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="hb-reg-field">
              <label className="hb-reg-label" htmlFor="email">Email address</label>
              <div className="hb-reg-input-wrap">
                <span className="hb-reg-input-icon"><IconMail /></span>
                <input
                  id="email"
                  className="hb-reg-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="hb-reg-field">
              <label className="hb-reg-label" htmlFor="password">Password</label>
              <div className="hb-reg-input-wrap">
                <span className="hb-reg-input-icon"><IconLock /></span>
                <input
                  id="password"
                  className="hb-reg-input has-action"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="hb-reg-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>

              {/* Strength meter */}
              {password && (
                <div className="hb-reg-strength">
                  <div className="hb-reg-strength-bars">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`hb-reg-strength-bar ${i <= strength.score ? `filled-${strength.score}` : ""}`}
                      />
                    ))}
                  </div>
                  <span
                    className="hb-reg-strength-label"
                    style={{ color: strength.color }}
                  >
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {error && <div className="hb-reg-error">{error}</div>}

            <button
              className="hb-reg-btn-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating account…"
                : <> Create account as {role === "jobseeker" ? "Job Seeker" : "Recruiter"} <IconArrow /> </>
              }
            </button>

          </form>

          <p className="hb-reg-terms">
            By registering you agree to our{" "}
            <Link to="/terms">Terms of Service</Link>{" "}
            &amp;{" "}
            <Link to="/privacy">Privacy Policy</Link>
          </p>

          <p className="hb-reg-footer">
            Already have an account?{" "}
            <Link to="/login">Sign in →</Link>
          </p>

        </div>
      </section>

    </div>
  );
};

export default Register;