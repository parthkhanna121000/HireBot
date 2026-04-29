import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { forgotPassword, resetPassword } from "../services/auth.api";
import "../auth.form.scss";

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

const FeaturePill = ({ icon, text, delay }) => (
  <div className="hb-pill" style={{ animationDelay: delay }}>
    <span className="hb-pill-icon">{icon}</span>
    {text}
  </div>
);

const StatCard = ({ value, label, delay }) => (
  <div className="hb-stat" style={{ animationDelay: delay }}>
    <span className="hb-stat-value">{value}</span>
    <span className="hb-stat-label">{label}</span>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────
const ForgotResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // If token + id are in URL → we're in "reset" mode, else "forgot" mode
  const token  = searchParams.get("token");
  const userId = searchParams.get("id");
  const isReset = !!(token && userId);

  // ── Forgot state ──
  const [email, setEmail]           = useState("");
  const [sent, setSent]             = useState(false);

  // ── Reset state ──
  const [newPassword, setNewPassword]   = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone]                 = useState(false);

  // ── Shared ──
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");

  // ── Forgot submit ──
  const handleForgot = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("Please enter your email."); return; }
    setSubmitting(true);
    try {
      await forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Reset submit ──
  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    setSubmitting(true);
    try {
      await resetPassword({ token, userId, newPassword });
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message || "Link expired or invalid. Request a new one.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Invalid reset link (token/id missing but we somehow hit reset) ──
  const invalidLink = token !== null && userId === null || token === null && userId !== null;

  return (
    <div className="hb-root">

      {/* ── Left branding panel — identical to Login ── */}
      <aside className="hb-left">
        <div className="hb-left-inner">

          <div className="hb-brand">
            {/* <div className="hb-logo-mark">H</div> */}
            <span className="hb-brand-name">HireBot</span>
          </div>

          <div className="hb-hero">
            <span className="hb-eyebrow">Account Security</span>
            <h2 className="hb-headline">
              {isReset
                ? <>Set your <em>new password</em></>
                : <>Recover your <em>account</em> instantly</>
              }
            </h2>
            <p className="hb-desc">
              {isReset
                ? "Choose a strong password to keep your HireBot account secure. You'll be signed in automatically after reset."
                : "Enter your registered email and we'll send you a secure reset link. It expires in 15 minutes."
              }
            </p>
            <div className="hb-pills">
              <FeaturePill icon="✦" text="Secure SHA-256 reset tokens"   delay="0.30s" />
              <FeaturePill icon="◈" text="Links expire in 15 minutes"    delay="0.38s" />
              <FeaturePill icon="⬡" text="HTTP-only cookie authentication" delay="0.46s" />
            </div>
          </div>

          <div className="hb-stats">
            <StatCard value="256-bit" label="Encryption"      delay="0.40s" />
            <StatCard value="15 min"  label="Token expiry"    delay="0.46s" />
            <StatCard value="100%"    label="Secure delivery" delay="0.52s" />
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

          {/* ════ INVALID LINK STATE ════ */}
          {invalidLink ? (
            <>
              <div className="hb-card-header">
                <h1 className="hb-card-title">Invalid reset link</h1>
                <p className="hb-card-sub">This link is missing required parameters.</p>
              </div>
              <div className="hb-error" style={{ textAlign: "center" }}>
                ⚠️ &nbsp;Please request a new password reset link.
              </div>
              <Link to="/forgot-password" className="hb-btn-submit" style={{ textDecoration: "none", justifyContent: "center" }}>
                Request new link <IconArrow />
              </Link>
              <p className="hb-footer">
                <Link to="/login">← Back to sign in</Link>
              </p>
            </>
          )

          /* ════ FORGOT PASSWORD MODE ════ */
          : !isReset ? (
            <>
              <div className="hb-card-header">
                <h1 className="hb-card-title">Forgot password?</h1>
                <p className="hb-card-sub">Enter your email and we'll send you a reset link.</p>
              </div>

              {sent ? (
                /* Success state */
                <div style={{
                  background: "rgba(74,222,128,0.08)",
                  border: "1px solid rgba(74,222,128,0.2)",
                  borderRadius: 12,
                  padding: "24px 20px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}>
                  <div style={{ fontSize: 32 }}>📬</div>
                  <p style={{ color: "#4ade80", fontWeight: 600, margin: 0, fontSize: 15 }}>
                    Check your inbox
                  </p>
                  <p style={{ color: "#8b92a8", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                    If <strong style={{ color: "#f0f2f8" }}>{email}</strong> is
                    registered, a reset link has been sent. It expires in 15 minutes.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgot}>
                  <div className="hb-field">
                    <label className="hb-label" htmlFor="fp-email">Email address</label>
                    <div className="hb-input-wrap">
                      <span className="hb-input-icon"><IconMail /></span>
                      <input
                        id="fp-email"
                        className="hb-input"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {error && <div className="hb-error">{error}</div>}

                  <button className="hb-btn-submit" type="submit" disabled={submitting}>
                    {submitting ? "Sending…" : <> Send reset link <IconArrow /> </>}
                  </button>
                </form>
              )}

              <p className="hb-footer">
                <Link to="/login">← Back to sign in</Link>
              </p>
            </>
          )

          /* ════ RESET PASSWORD MODE ════ */
          : (
            <>
              <div className="hb-card-header">
                <h1 className="hb-card-title">Set new password</h1>
                <p className="hb-card-sub">Choose a strong password for your account.</p>
              </div>

              {done ? (
                /* Success state */
                <div style={{
                  background: "rgba(74,222,128,0.08)",
                  border: "1px solid rgba(74,222,128,0.2)",
                  borderRadius: 12,
                  padding: "24px 20px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}>
                  <div style={{ fontSize: 32 }}>✅</div>
                  <p style={{ color: "#4ade80", fontWeight: 600, margin: 0, fontSize: 15 }}>
                    Password updated!
                  </p>
                  <p style={{ color: "#8b92a8", fontSize: 13, margin: 0 }}>
                    Redirecting you to login in 3 seconds…
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReset}>
                  <div className="hb-field">
                    <label className="hb-label" htmlFor="rp-password">New password</label>
                    <div className="hb-input-wrap">
                      <span className="hb-input-icon"><IconLock /></span>
                      <input
                        id="rp-password"
                        className="hb-input has-action"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
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

                  {error && <div className="hb-error">{error}</div>}

                  <button className="hb-btn-submit" type="submit" disabled={submitting} style={{ marginTop: 8 }}>
                    {submitting ? "Updating…" : <> Update password <IconArrow /> </>}
                  </button>
                </form>
              )}

              <p className="hb-footer">
                <Link to="/login">← Back to sign in</Link>
              </p>
            </>
          )}

        </div>
      </section>

    </div>
  );
};

export default ForgotResetPassword;