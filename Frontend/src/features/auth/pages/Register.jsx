import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import "../../../styles/auth.register.scss";

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

const IconUser = () => (
  <svg {...iconProps}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

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

// ── Password strength helper ───────────────────────────────────────────────
const STRENGTH = [
  { label: "Too short" },
  { label: "Weak" },
  { label: "Fair" },
  { label: "Good" },
  { label: "Strong" },
];

const getStrength = (pw) => {
  if (!pw) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return { score, label: STRENGTH[score].label };
};

// ── Role-aware copy ────────────────────────────────────────────────────────
const COPY = {
  jobseeker: {
    headline: ["Know where your resume", "stands before they do."],
    desc: "Check your resume against any job, see what is missing, and fix it before you apply.",
    steps: [
      ["Upload your resume", "A PDF and the job you are targeting."],
      ["Get your match score", "Scored on ATS, skills and keywords."],
      ["Fix the gaps and apply", "Rewritten bullets and an interview plan."],
    ],
  },
  recruiter: {
    headline: ["Read the best", "applications first."],
    desc: "Every applicant is scored the moment they apply, so your inbox opens already ranked.",
    steps: [
      ["Post a role", "Use AI to tighten the job description."],
      ["Candidates are scored", "Each resume is matched to your role."],
      ["Review the ranking", "Shortlist, reject or invite. You decide."],
    ],
  },
};

const ROLES = [
  { key: "jobseeker", label: "Job seeker", hint: "Improve my resume" },
  { key: "recruiter", label: "Recruiter", hint: "Hire faster" },
];

// ── Main component ─────────────────────────────────────────────────────────
const Register = () => {
  const navigate = useNavigate();
  const { loading, handleRegister } = useAuth();

  const [role, setRole] = useState("jobseeker");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const strength = getStrength(password);
  const copy = COPY[role];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password) {
      setError("Fill in your username, email and password to continue.");
      return;
    }
    if (password.length < 6) {
      setError("Use a password with at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await handleRegister({ username, email, password, role });

      // ── Role-based redirect ──────────────────────────────────────
      if (data?.user?.role === "recruiter") {
        navigate("/recruiter");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "We could not create your account. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="hb-reg-root">
        <div className="hb-reg-loading" role="status">
          <span className="hb-reg-brand-name">HireBot</span>
          <div className="hb-reg-spinner" />
          <p>Creating your account…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hb-reg-root">
      {/* ── Left editorial panel ── */}
      <aside className="hb-reg-left">
        <div className="hb-reg-left-inner">
          <Link to="/" className="hb-reg-brand" aria-label="HireBot home">
            <span className="hb-reg-brand-name">HireBot</span>
          </Link>

          <div className="hb-reg-hero">
            <h2 className="hb-reg-headline" key={role}>
              {copy.headline[0]} <em>{copy.headline[1]}</em>
            </h2>
            <p className="hb-reg-desc">{copy.desc}</p>

            <ol className="hb-reg-steps">
              {copy.steps.map(([title, desc], i) => (
                <li className="hb-reg-step" key={`${role}-${i}`}>
                  <span className="hb-reg-step-num">{i + 1}</span>
                  <div className="hb-reg-step-body">
                    <div className="hb-reg-step-title">{title}</div>
                    <div className="hb-reg-step-desc">{desc}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <p className="hb-reg-note">
            Resumes are read in memory and never written to disk. AI scores
            support your decision. They do not replace it.
          </p>
        </div>
      </aside>

      {/* ── Right form panel ── */}
      <section className="hb-reg-right">
        <div className="hb-reg-card">
          {/* Mobile-only logo */}
          <Link to="/" className="hb-reg-card-logo" aria-label="HireBot home">
            <span className="hb-reg-brand-name">HireBot</span>
          </Link>

          <div className="hb-reg-card-header">
            <h1 className="hb-reg-card-title">Create your account</h1>
            <p className="hb-reg-card-sub">Free to start. No card needed.</p>
          </div>

          {/* Role selector */}
          <div className="hb-reg-roles" role="radiogroup" aria-label="I am a">
            {ROLES.map((r) => (
              <button
                key={r.key}
                type="button"
                role="radio"
                aria-checked={role === r.key}
                className={`hb-reg-role ${role === r.key ? "active" : ""}`}
                onClick={() => setRole(r.key)}
              >
                <span className="hb-reg-role-label">{r.label}</span>
                <span className="hb-reg-role-hint">{r.hint}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="hb-reg-field">
              <label className="hb-reg-label" htmlFor="username">
                Username
              </label>
              <div className="hb-reg-input-wrap">
                <span className="hb-reg-input-icon">
                  <IconUser />
                </span>
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
              <label className="hb-reg-label" htmlFor="email">
                Email address
              </label>
              <div className="hb-reg-input-wrap">
                <span className="hb-reg-input-icon">
                  <IconMail />
                </span>
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
              <label className="hb-reg-label" htmlFor="password">
                Password
              </label>
              <div className="hb-reg-input-wrap">
                <span className="hb-reg-input-icon">
                  <IconLock />
                </span>
                <input
                  id="password"
                  className="hb-reg-input has-action"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
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

              {password && (
                <div className="hb-reg-strength">
                  <div className="hb-reg-strength-bars">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`hb-reg-strength-bar ${
                          i <= strength.score ? `filled-${strength.score}` : ""
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`hb-reg-strength-label s-${strength.score}`}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div aria-live="polite">
              {error && <div className="hb-reg-error">{error}</div>}
            </div>

            <button
              className="hb-reg-btn-submit"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                "Creating account…"
              ) : (
                <>
                  Create {role === "jobseeker" ? "job seeker" : "recruiter"}{" "}
                  account <IconArrow />
                </>
              )}
            </button>
          </form>

          <p className="hb-reg-terms">
            By creating an account you agree to our{" "}
            <Link to="/terms">Terms of Service</Link> and{" "}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>

          <p className="hb-reg-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Register;