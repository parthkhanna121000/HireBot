import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useAuth } from "../auth/hooks/useAuth";
import "./styles/landing.scss";

// ─── Inline Brand Logo (Ensures clean side-by-side alignment) ─────────────────
function BrandLogo() {
  return (
    <div className="nav-logo-box">
      <div className="logo-badge">H</div>
      <span className="logo-text">
        HireBot<span className="logo-sub">AI</span>
      </span>
    </div>
  );
}

// ─── Complete Inline Icons Suite (Zero External Dependencies) ─────────────────
const Icon = {
  Upload: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  Brain: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
    </svg>
  ),
  Rocket: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  ),
  Menu: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ),
  Sparkles: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/>
      <path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z"/>
    </svg>
  ),
  Shield: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Target: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  File: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
};

// ─── Scroll Progress Component ────────────────────────────────────────────────
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      setPct(Math.min((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100, 100));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="scroll-progress" style={{ width: `${pct}%` }} />;
}

// ─── Animated Counter Component ──────────────────────────────────────────────
function AnimNum({ value, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const num = parseFloat(value);
    const isFloat = value.includes(".");
    let start = 0;
    const step = num / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= num) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(isFloat ? start.toFixed(1) : Math.floor(start).toString());
      }
    }, 30);
    return () => clearInterval(timer);
  }, [inView, value]);

  return <span ref={ref}>{display}{suffix}</span>;
}

// ─── Navbar Component ─────────────────────────────────────────────────────────
function Navbar({ onOpenMobileMenu }) {
  const navigate = useNavigate();
  const { user, isAdmin, handleLogout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onLogout = async () => {
    await handleLogout();
    navigate("/");
  };

  return (
    <nav className={`landing-nav ${scrolled ? "landing-nav--scrolled" : ""}`}>
      <div className="nav-logo" onClick={() => navigate("/")}>
        <BrandLogo />
      </div>

      <div className="nav-links">
        <button className="nav-link" onClick={() => navigate("/jobs")}>Explore Jobs</button>
        <button className="nav-link" onClick={() => navigate("/recruiter")}>For Recruiters</button>
        <button className="nav-link nav-link--highlight" onClick={() => navigate("/pricing")}>Pricing</button>
        <div className="nav-divider" />

        {isAdmin && (
          <>
            <button className="nav-link nav-link--admin" onClick={() => navigate("/admin")}>
              <span className="nav-admin-dot" /> Admin
            </button>
            <button className="btn-login" onClick={onLogout}>Log out</button>
          </>
        )}

        {user && !isAdmin && (
          <>
            <button className="btn-login" onClick={() => navigate(user.role === "recruiter" ? "/recruiter" : "/dashboard")}>Dashboard</button>
            <button className="btn-login" onClick={onLogout}>Log out</button>
          </>
        )}

        {!user && (
          <>
            <button className="btn-login" onClick={() => navigate("/login")}>Log in</button>
            <button className="btn-signup" onClick={() => navigate("/register")}>
              Get started free <Icon.ArrowRight />
            </button>
          </>
        )}
      </div>

      <button className="nav-hamburger" onClick={onOpenMobileMenu} aria-label="Open mobile menu">
        <Icon.Menu />
      </button>
    </nav>
  );
}

// ─── Mobile Menu Drawer ───────────────────────────────────────────────────────
function MobileMenu({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, isAdmin, handleLogout } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="mobile-menu-overlay" onClick={onClose}>
      <motion.div
        className="mobile-menu-drawer"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mobile-menu-header">
          <div className="nav-logo" onClick={() => { navigate("/"); onClose(); }}>
            <BrandLogo />
          </div>
          <button className="mobile-menu-close" onClick={onClose} aria-label="Close menu">
            <Icon.X />
          </button>
        </div>
        <div className="mobile-menu-links">
          <button onClick={() => { navigate("/jobs"); onClose(); }}>Explore Jobs</button>
          <button onClick={() => { navigate("/recruiter"); onClose(); }}>For Recruiters</button>
          <button onClick={() => { navigate("/pricing"); onClose(); }}>Pricing</button>
          <div className="mobile-divider" />
          {user ? (
            <>
              <button onClick={() => { navigate(isAdmin ? "/admin" : user.role === "recruiter" ? "/recruiter" : "/dashboard"); onClose(); }}>
                Dashboard
              </button>
              <button className="mobile-btn-logout" onClick={async () => { await handleLogout(); navigate("/"); onClose(); }}>
                Log out
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { navigate("/login"); onClose(); }}>Log in</button>
              <button className="mobile-btn-signup" onClick={() => { navigate("/register"); onClose(); }}>
                Get Started Free
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Dark Hero Section ────────────────────────────────────────────────────────
function Hero() {
  const navigate = useNavigate();
  const stageRef = useRef(null);
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mvY, [-0.5, 0.5], [6, -6]), { stiffness: 100, damping: 20 });
  const rotateY = useSpring(useTransform(mvX, [-0.5, 0.5], [-8, 8]), { stiffness: 100, damping: 20 });

  const handleMove = (e) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    mvX.set((e.clientX - rect.left) / rect.width - 0.5);
    mvY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => { mvX.set(0); mvY.set(0); };

  const bars = [
    { label: "Skills Match Quality", pct: 88, color: "#635BFF" },
    { label: "Experience Impact", pct: 79, color: "#A7F3D0" },
    { label: "Keyword Density", pct: 92, color: "#635BFF" },
  ];

  return (
    <section className="hero">
      <div className="hero-grid" />
      <div className="hero-orb-1" />
      <div className="hero-orb-2" />
      <div className="hero-inner">
        <div className="hero-copy">
          <motion.div className="hero-eyebrow" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="badge-dot" /> AI-POWERED CAREER TOOL <Icon.Sparkles />
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            Make every application count. <br />
            <span className="highlight">Analyze with purpose.</span>
          </motion.h1>

          <motion.p className="hero-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
            Analyze your resume. Find skill gaps. Prepare with purpose using state-of-the-art recruitment neural models.
          </motion.p>

          <motion.div className="hero-ctas" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <button className="btn-primary-lg" onClick={() => navigate("/resume-analyzer")}>
              Analyze my resume <Icon.ArrowRight />
            </button>
            <button className="btn-secondary-lg" onClick={() => navigate("/jobs")}>
              Explore features
            </button>
          </motion.div>

          <motion.div className="hero-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
            {[
              { value: "50", suffix: "k+", label: "Resumes Evaluated" },
              { value: "3.2", suffix: "×", label: "Callback Multiplier" },
              { value: "98", suffix: "%", label: "ATS Pass Accuracy" },
            ].map((s) => (
              <div className="stat" key={s.label}>
                <span className="stat-num"><AnimNum value={s.value} suffix={s.suffix} /></span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="hero-3d-wrap"
          ref={stageRef}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          style={{ rotateX, rotateY, transformPerspective: 1000 }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="hero-3d-cursor-glow" />
          <div className="hero-3d-stage">
            <div className="core-header">
              <span className="core-title"><Icon.File /> AI Resume Intelligence Core</span>
              <span className="core-live"><span className="core-live-dot" />Live Scan</span>
            </div>
            <div className="core-score-row">
              <div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4, fontWeight: 700 }}>OVERALL READINESS SCORE</div>
                <span className="core-score">84<span>/100</span></span>
              </div>
              <div className="core-score-ring">
                <svg viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                  <circle cx="20" cy="20" r="17" fill="none" stroke="#635BFF" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 17} strokeDashoffset={2 * Math.PI * 17 * (1 - 0.84)} transform="rotate(-90 20 20)" />
                </svg>
              </div>
            </div>
            {bars.map((b, i) => (
              <div className="core-bar-row" key={i}>
                <div className="core-bar-top"><span>{b.label}</span><span>{b.pct}%</span></div>
                <div className="core-bar-track"><div className="core-bar-fill" style={{ width: `${b.pct}%`, background: b.color }} /></div>
              </div>
            ))}
            <div className="core-missing">
              <span className="core-missing-label">Identified Targets</span>
              <div className="core-missing-tags">
                {["System Architecture", "GraphQL", "Kubernetes"].map((s) => <span key={s} className="tag-missing">{s}</span>)}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Asymmetric Bento Grid Feature Section ────────────────────────────────────
function BentoFeatures() {
  return (
    <section className="bento-section">
      <div className="section-container">
        <div className="section-header-editorial">
          <span className="editorial-eyebrow">BUILT FOR THE JOB SEARCH</span>
          <h2>Clarity at every step.</h2>
          <p>Engineered for candidates and recruiters who demand precision, deep semantic matching, and uncompromising clarity.</p>
        </div>

        <div className="bento-grid">
          {/* Card 1: Resume Analysis */}
          <div className="bento-card bento-card-large">
            <div>
              <span className="bento-badge badge-indigo">Resume Analysis</span>
              <h3>Understand your resume score.</h3>
              <p>Evaluate your experience impact, keyword density, and structural readability across 40+ recruitment checkpoints.</p>
            </div>
            <div className="mini-mock-score">
              <div className="mock-num">88%</div>
              <div className="mock-bars">
                <div className="mock-track"><div className="mock-fill fill-indigo" style={{ width: "88%" }} /></div>
                <div className="mock-track"><div className="mock-fill fill-mint" style={{ width: "94%" }} /></div>
              </div>
            </div>
          </div>

          {/* Card 2: ATS Shield */}
          <div className="bento-card bento-card-medium">
            <div>
              <span className="bento-badge badge-mint">ATS Shield</span>
              <h3>Military-Grade ATS Check.</h3>
              <p>Ensure machine-readable section hierarchy and avoid automated parser rejection.</p>
            </div>
            <div className="mock-check-list">
              <div className="check-item"><span className="check-ok">✓</span> Single-column structure verified</div>
              <div className="check-item"><span className="check-ok">✓</span> Standard headings detected</div>
            </div>
          </div>

          {/* Card 3: Skill Gap */}
          <div className="bento-card bento-card-medium">
            <div>
              <span className="bento-badge badge-amber">Skill Gap</span>
              <h3>Skill-gap insights.</h3>
              <p>See what to improve next by matching your profile against target job descriptions instantly.</p>
            </div>
            <div className="mock-tags-flex">
              <span className="tag-have">React</span>
              <span className="tag-have">TypeScript</span>
              <span className="tag-lack">+ Kubernetes</span>
            </div>
          </div>

          {/* Card 4: AI Enhancer */}
          <div className="bento-card bento-card-small">
            <div>
              <span className="bento-badge badge-violet">AI Enhancer</span>
              <h3>Metric-Driven Rewrites</h3>
              <p>Transform passive duty descriptions into high-impact achievement bullets backed by metrics.</p>
            </div>
          </div>

          {/* Card 5: Interview Simulator */}
          <div className="bento-card bento-card-small">
            <div>
              <span className="bento-badge badge-rose">Interview Simulator</span>
              <h3>Custom STAR Questions</h3>
              <p>Generate hyper-targeted technical and behavioral prompts mined directly from your resume.</p>
            </div>
          </div>

          {/* Card 6: Recruiter Suite */}
          <div className="bento-card bento-card-full">
            <div>
              <span className="bento-badge badge-cyan">Recruiter Suite</span>
              <h3>Autonomous Candidate Sorting for Teams</h3>
              <p>Empower hiring managers to rank hundreds of applicants instantly with automated skill fit scores and objective screening summaries.</p>
            </div>
            <div className="mock-recruiter-table">
              <div className="table-row">
                <span>Sarah Jenkins</span>
                <span className="match-pill">96% Match</span>
              </div>
              <div className="table-row">
                <span>Marcus Chen</span>
                <span className="match-pill">91% Match</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing Section ──────────────────────────────────────────────────────────
const PRICING_PLANS = [
  {
    name: "Free Tier",
    price: "₹0",
    period: "forever",
    desc: "Essential tools for casual job seekers starting their search.",
    highlight: false,
    features: ["Limited resume analyses / month", "Limited interview reports / day", "Job board listings & direct apply", "Application tracking dashboard"],
    cta: "Get Started Free",
    key: "free",
  },
  {
    name: "Pro Access",
    price: "₹499",
    period: "/month",
    desc: "Full AI capabilities for dedicated professionals accelerating their career.",
    highlight: true,
    badge: "Most Popular",
    features: ["Unlimited deep resume analyses", "Unlimited AI interview prep sessions", "Priority high-speed AI processing", "Advanced recruiter insights & match", "HD PDF exports & AI bullet rewriter"],
    cta: "Upgrade to Pro",
    key: "pro_monthly",
  },
  {
    name: "Annual Pass",
    price: "₹3,999",
    period: "/year",
    desc: "Maximum savings and uninterrupted year-round career advancement.",
    highlight: false,
    badge: "Save 33%",
    features: ["Everything in Pro Access included", "Full 12 months uninterrupted access", "~₹333/month effective pricing", "Priority high-speed AI processing", "HD PDF exports & AI bullet rewriter"],
    cta: "Get Annual Pass",
    key: "pro_annual",
  },
];

function PricingSection() {
  const navigate = useNavigate();
  return (
    <section className="pricing-section">
      <div className="section-container">
        <div className="section-header-editorial">
          <span className="editorial-eyebrow">INVESTMENT & PLANS</span>
          <h2>Transparent pricing. Uncompromising value.</h2>
          <p>Choose the tier that matches your career momentum. No hidden fees.</p>
        </div>

        <div className="pricing-grid">
          {PRICING_PLANS.map((plan, i) => (
            <div className={`pricing-card ${plan.highlight ? "pricing-card--highlight" : ""}`} key={i}>
              {plan.badge && <div className="pricing-badge">{plan.badge}</div>}
              <div className="pricing-header">
                <h3>{plan.name}</h3>
                <p>{plan.desc}</p>
                <div className="pricing-cost">
                  <span className="price-num">{plan.price}</span>
                  <span className="price-period">{plan.period}</span>
                </div>
              </div>
              <div className="pricing-features">
                {plan.features.map((f, idx) => (
                  <div className="pricing-feature-row" key={idx}>
                    <span className="chk-icon"><Icon.Check /></span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <button className={plan.highlight ? "btn-pricing-primary" : "btn-pricing-secondary"} onClick={() => navigate("/pricing")}>
                {plan.cta} <Icon.ArrowRight />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA & Footer Components ──────────────────────────────────────────────────
function CallToActionSection() {
  const navigate = useNavigate();
  return (
    <section className="cta-section">
      <div className="section-container">
        <div className="cta-box">
          <div className="cta-badge"><Icon.Sparkles /> READY TO ACCELERATE?</div>
          <h2>Land your dream role with absolute confidence.</h2>
          <p>Join thousands of professionals using HireBot AI to optimize resumes, bypass ATS filters, and ace interviews.</p>
          <div className="cta-actions">
            <button className="btn-hero-primary" onClick={() => navigate("/register")}>
              Get started for free <Icon.ArrowRight />
            </button>
            <button className="btn-hero-secondary" onClick={() => navigate("/jobs")}>
              Browse open positions
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="landing-footer">
      <div className="section-container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="nav-logo" onClick={() => navigate("/")}>
              <BrandLogo />
            </div>
            <p className="footer-desc">Autonomous AI-powered resume intelligence, recruitment screening, and interview preparation.</p>
            <div className="footer-copy">© {new Date().getFullYear()} HireBot AI Inc. All rights reserved.</div>
          </div>
          <div className="footer-col">
            <h4>Platform</h4>
            <button onClick={() => navigate("/resume-analyzer")}>Resume Analyzer</button>
            <button onClick={() => navigate("/jobs")}>Job Board</button>
            <button onClick={() => navigate("/recruiter")}>Recruiter Command</button>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <button onClick={() => navigate("/pricing")}>Pricing Plans</button>
            <button onClick={() => navigate("/login")}>Sign In</button>
            <button onClick={() => navigate("/register")}>Create Account</button>
          </div>
          <div className="footer-col">
            <h4>Legal & Compliance</h4>
            <span className="footer-link-text">Privacy Policy</span>
            <span className="footer-link-text">Terms of Service</span>
            <span className="footer-link-text">Security & ATS Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Export Component ────────────────────────────────────────────────────
export default function HirebotLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="hirebot-landing-page">
      <ScrollProgress />
      <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <Hero />
      <BentoFeatures />
      <PricingSection />
      <CallToActionSection />
      <Footer />
    </div>
  );
}