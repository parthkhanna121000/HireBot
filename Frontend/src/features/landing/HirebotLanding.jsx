import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  AnimatePresence,
} from "framer-motion";
import { useAuth } from "../auth/hooks/useAuth";
import HireBotLogo from "../shared/Logo";
import "./styles/landing.scss";

// ─── Icons Suite ──────────────────────────────────────────────────────────────
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
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ),
  ArrowDown: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12l7 7 7-7"/>
    </svg>
  ),
  Sparkles: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/>
      <path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z"/>
    </svg>
  ),
  Zap: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Shield: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  File: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  Target: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
};

// ─── Feature Configurations with Enhanced Details ────────────────────────────
const FEATURES = [
  {
    id: "score", label: "Resume Score", color: "#6366f1",
    bgAlpha: "rgba(99,102,241,0.08)", borderAlpha: "rgba(99,102,241,0.25)",
    badgeBg: "rgba(99,102,241,0.15)", badgeColor: "#a5b4fc",
    title: "Instant AI Resume Scoring Engine",
    desc: "Our neural evaluator processes your resume across 40+ recruitment metrics in under 3 seconds, delivering an uncompromising, data-driven score with actionable clarity.",
    bullets: ["Comprehensive ATS compatibility scan", "Granular section-by-section breakdown", "Competitive benchmarking against top tier applicant profiles", "Dynamic real-time scoring updates as you edit"],
  },
  {
    id: "ats", label: "ATS Optimizer", color: "#10b981",
    bgAlpha: "rgba(16,185,129,0.08)", borderAlpha: "rgba(16,185,129,0.25)",
    badgeBg: "rgba(16,185,129,0.15)", badgeColor: "#6ee7b7",
    title: "Military-Grade ATS Shield",
    desc: "Over 75% of resumes are discarded by automated parsing filters before a human ever sets eyes on them. We eliminate formatting traps, unreadable tables, and parse errors.",
    bullets: ["Keyword density & semantic matching", "Machine-readable structural layout validation", "Standardized section heading verification", "Recruiter-friendly hierarchy recommendations"],
  },
  {
    id: "gap", label: "Skill Gap", color: "#f59e0b",
    bgAlpha: "rgba(245,158,11,0.08)", borderAlpha: "rgba(245,158,11,0.25)",
    badgeBg: "rgba(245,158,11,0.15)", badgeColor: "#fbbf24",
    title: "Precision Skill Gap Intelligence",
    desc: "Targeting a specific dream role? Paste the job description to instantly uncover exact competency discrepancies, missing technologies, and curated mastery paths.",
    bullets: ["Deep semantic job description matching", "Instant extraction of missing technical stack requirements", "Targeted learning resource mapping & priority ranking", "Role readiness confidence percentage"],
  },
  {
    id: "suggest", label: "AI Suggestions", color: "#8b5cf6",
    bgAlpha: "rgba(139,92,246,0.08)", borderAlpha: "rgba(139,92,246,0.25)",
    badgeBg: "rgba(139,92,246,0.15)", badgeColor: "#c4b5fd",
    title: "Metric-Driven AI Bullet Rewriter",
    desc: "Vague responsibilities kill interview prospects. Our generative AI rewrites weak descriptions into powerful, high-impact accomplishment statements backed by metrics.",
    bullets: ["Transformation of passive duties into active achievements", "Strategic integration of strong industry action verbs", "Automatic quantification suggestions", "Tailoring specifically tuned to seniority level"],
  },
  {
    id: "interview", label: "Interview Prep", color: "#f43f5e",
    bgAlpha: "rgba(244,63,94,0.08)", borderAlpha: "rgba(244,63,94,0.25)",
    badgeBg: "rgba(244,63,94,0.15)", badgeColor: "#fda4af",
    title: "Customized AI Interview Simulator",
    desc: "Generate hyper-targeted technical questions, rigorous behavioral STAR scenarios, and system design prompts mined directly from your resume profile and job listing.",
    bullets: ["Custom technical questionnaires mapped to your exact tech stack", "Behavioral STAR prompt generator", "Company culture and interview style alignment", "Exemplar response answer frameworks"],
  },
  {
    id: "ranking", label: "Smart Hiring", color: "#06b6d4",
    bgAlpha: "rgba(6,182,212,0.08)", borderAlpha: "rgba(6,182,212,0.25)",
    badgeBg: "rgba(6,182,212,0.15)", badgeColor: "#67e8f9",
    title: "Autonomous Candidate Sorting for Teams",
    desc: "Empower HR teams and hiring managers to rank hundreds of applicants instantly with automated matching percentages, highlighted strengths, and potential red flag alerts.",
    bullets: ["Automated ranked candidate shortlisting", "Instant skill fit score per job requisition", "Concise candidate executive summaries", "Bias-reduced and objective preliminary screening"],
  },
];

// ─── Pricing Plans ────────────────────────────────────────────────────────────
const LANDING_PLANS = [
  {
    key: "free", name: "Free Tier", price: "₹0", period: "forever", badge: null, highlight: false, color: "#6366f1",
    features: [
      { text: "Limited resume analyses / month", ok: true },
      { text: "Limited interview reports / day", ok: true },
      { text: "Job board listings & direct apply", ok: true },
      { text: "Application tracking dashboard", ok: true },
      { text: "Unlimited resume scans", ok: false },
      { text: "Priority AI processing core", ok: false },
    ],
    cta: "Get Started Free",
  },
  {
    key: "pro_monthly", name: "Pro Access", price: "₹499", period: "/month", badge: "Most Popular", highlight: true, color: "#8b5cf6",
    features: [
      { text: "Unlimited deep resume analyses", ok: true },
      { text: "Unlimited AI interview prep sessions", ok: true },
      { text: "All Free Tier features included", ok: true },
      { text: "Priority high-speed AI processing", ok: true },
      { text: "Advanced recruiter insights & match", ok: true },
      { text: "HD PDF exports & AI bullet rewriter", ok: true },
    ],
    cta: "Upgrade to Pro",
  },
  {
    key: "pro_annual", name: "Annual Pass", price: "₹3,999", period: "/year", badge: "Save 33%", highlight: false, color: "#f59e0b",
    features: [
      { text: "Everything in Pro Access", ok: true },
      { text: "Full 12 months uninterrupted access", ok: true },
      { text: "~₹333/month effective pricing", ok: true },
      { text: "Priority high-speed AI processing", ok: true },
      { text: "Advanced recruiter insights & match", ok: true },
      { text: "HD PDF exports & AI bullet rewriter", ok: true },
    ],
    cta: "Get Annual Pass",
  },
];

// ─── Particle Canvas Background ───────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight * 1.5;
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15,
      alpha: Math.random() * 0.4 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(129, 140, 248, ${p.alpha})`; ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(129, 140, 248, ${0.06 * (1 - dist / 120)})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight * 1.5; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} className="hero-canvas" />;
}

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

// ─── Animated Number Counter ──────────────────────────────────────────────────
function AnimNum({ value, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    if (!inView) return;
    const num = parseFloat(value); const isFloat = value.includes(".");
    let start = 0; const step = num / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setDisplay(value); clearInterval(timer); }
      else setDisplay(isFloat ? start.toFixed(1) : Math.floor(start).toString());
    }, 30);
    return () => clearInterval(timer);
  }, [inView, value]);
  return <span ref={ref}>{display}{suffix}</span>;
}

// ─── Feature Mockups for Tabs ─────────────────────────────────────────────────
function MockScore({ color }) {
  const circ = 2 * Math.PI * 52;
  const bars = [
    { label: "Skills Match Quality", pct: 88, color: "#6366f1" },
    { label: "Experience Impact", pct: 79, color: "#10b981" },
    { label: "Keyword Density", pct: 92, color: "#f59e0b" },
  ];
  return (
    <div className="mock-inner">
      <div className="mock-score-ring">
        <svg viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
          <motion.circle cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ * (1 - 0.84) }} transition={{ duration: 1.5, ease: "easeOut" }}/>
        </svg>
        <div className="mock-score-num">84</div>
      </div>
      <div className="mock-bars">
        {bars.map((b) => (
          <div className="mock-bar-row" key={b.label}>
            <div className="mock-bar-top">
              <span style={{ color:"var(--text-muted)", fontSize:12 }}>{b.label}</span>
              <span style={{ color:"var(--text-main)", fontSize:12, fontFamily:"var(--font-mono, monospace)" }}>{b.pct}%</span>
            </div>
            <div className="mock-bar-track">
              <motion.div className="mock-bar-fill" style={{ background:b.color }}
                initial={{ width:0 }} animate={{ width:`${b.pct}%` }} transition={{ duration:1.2, ease:"easeOut" }}/>
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:"1.25rem", marginTop:"1.25rem" }}>
        <div className="mock-missing-label">Identified Optimization Targets</div>
        <div className="mock-missing-tags">
          {["System Architecture","GraphQL","Kubernetes"].map((s) => <span key={s} className="tag-missing">{s}</span>)}
        </div>
      </div>
    </div>
  );
}

function MockAts({ color }) {
  const checks = [
    { ok:true, label:"Clean single-column structure parsed" },
    { ok:true, label:"Standard semantic section headers" },
    { ok:true, label:"Optimal keyword distribution ratio" },
    { ok:false, label:"Avoid embedding tables in header area" },
    { ok:true, label:"Font sizing & line height compliant" },
  ];
  return (
    <div className="mock-inner">
      <div className="mock-ats-score">
        <div className="mock-ats-num" style={{ color }}>98%</div>
        <div className="mock-ats-sublabel">ATS Compatibility Index</div>
      </div>
      <div className="ats-checks">
        {checks.map(({ ok, label }) => (
          <div className="ats-check-row" key={label}>
            <div className="ats-check-icon" style={{ background:ok?"rgba(16,185,129,0.15)":"rgba(244,63,94,0.15)", color:ok?"#10b981":"#f43f5e" }}>
              {ok ? <Icon.Check /> : <Icon.X />}
            </div>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockGap() {
  const skills = [
    {has:true, name:"React & Next.js"}, {has:true, name:"TypeScript"}, {has:true, name:"Node.js"},
    {has:false,name:"Docker Containers"}, {has:true, name:"Tailwind CSS"}, {has:false,name:"Kubernetes Pods"},
    {has:false,name:"GraphQL API"}, {has:true, name:"Git Workflow"}, {has:true, name:"REST Architecture"},
  ];
  return (
    <div className="mock-inner">
      <div className="gap-header">
        <div style={{ fontSize:14, fontWeight:700, color:"var(--text-main)" }}>Target Role: Senior Full-Stack Engineer</div>
        <div className="gap-sub">6 of 9 Competencies Matched</div>
      </div>
      <div className="gap-tags">
        {skills.map(({ has, name }) => (
          <div key={name} className={`gap-tag ${has ? "gap-have" : "gap-missing"}`}>
            <div className="gap-tag-icon" style={{ background:has?"rgba(16,185,129,0.2)":"rgba(244,63,94,0.2)" }}>
              {has ? <Icon.Check /> : <Icon.X />}
            </div>
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}

function MockSuggest({ color }) {
  const sug = [
    { before:"Worked on the backend database and wrote API endpoints", after:"Architected scalable Node.js microservices handling 2.5M+ daily requests with 99.99% uptime." },
    { before:"Helped improve frontend page load speeds", after:"Optimized React bundle delivery and caching strategies, accelerating render speed by 42%." },
  ];
  return (
    <div className="mock-inner">
      {sug.map((item, i) => (
        <div className="suggest-card" key={i}>
          <div className="suggest-label">Bullet Point #{i + 1} Enhancement</div>
          <div className="suggest-before">{item.before}</div>
          <div className="suggest-improved-label" style={{ color }}>▼ AI GENERATED REWRITE</div>
          <div className="suggest-after">{item.after}</div>
        </div>
      ))}
    </div>
  );
}

function MockInterview() {
  const qs = [
    { type:"Technical", typeColor:"#6366f1", borderColor:"#6366f1", text:"Explain React fiber reconciliation mechanics and when to apply useMemo vs useCallback memoization." },
    { type:"Behavioral", typeColor:"#f59e0b", borderColor:"#f59e0b", text:"Describe a critical production outage you triaged under tight deadlines. What structural trade-offs did you make?" },
    { type:"System Design", typeColor:"#8b5cf6", borderColor:"#8b5cf6", text:"Design a globally distributed real-time chat architecture supporting 50M concurrent connections." },
  ];
  return (
    <div className="mock-inner">
      {qs.map((q) => (
        <div className="interview-q" key={q.type} style={{ borderLeftColor:q.borderColor }}>
          <div className="interview-q-type" style={{ color:q.typeColor }}>{q.type} Question</div>
          <div className="interview-q-text">{q.text}</div>
        </div>
      ))}
    </div>
  );
}

function MockRanking({ color }) {
  const cands = [
    { name:"Sarah Jenkins", role:"React · Node · AWS", score:96, initials:"SJ", bg:"rgba(99,102,241,0.2)", c:"#a5b4fc" },
    { name:"Marcus Chen", role:"Vue · Python · Docker", score:91, initials:"MC", bg:"rgba(139,92,246,0.2)", c:"#c4b5fd" },
    { name:"Elena Rostova", role:"Angular · Java · K8s", score:88, initials:"ER", bg:"rgba(16,185,129,0.2)", c:"#6ee7b7" },
    { name:"Liam O'Connor", role:"React · GraphQL · Go", score:82, initials:"LO", bg:"rgba(245,158,11,0.2)", c:"#fbbf24" },
  ];
  return (
    <div className="mock-inner">
      {cands.map((c, i) => (
        <motion.div className="rank-item" key={c.name}
          initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i * 0.1, duration:0.4 }}>
          <div className="rank-pos">#{i + 1}</div>
          <div className="rank-avatar" style={{ background:c.bg, color:c.c }}>{c.initials}</div>
          <div className="rank-info">
            <div className="rank-name">{c.name}</div>
            <div className="rank-role">{c.role}</div>
          </div>
          <div className="rank-score" style={{ color }}>{c.score}%</div>
        </motion.div>
      ))}
    </div>
  );
}

const MOCK_MAP = { score: MockScore, ats: MockAts, gap: MockGap, suggest: MockSuggest, interview: MockInterview, ranking: MockRanking };

// ─── Navbar Component ─────────────────────────────────────────────────────────
function Navbar() {
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
        <div style={{ width: 34, height: 34, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15, boxShadow: "0 0 20px rgba(99,102,241,0.5)" }}>H</div>
        <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.03em", color: "#f8fafc" }}>HireBot<span style={{ color: "#38bdf8", fontFamily: "var(--font-mono)", fontSize: 13, marginLeft: 2 }}>AI</span></span>
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

      <button className="nav-hamburger"><Icon.Menu /></button>
    </nav>
  );
}

// ─── Hero 3D Interactive Dashboard Component ──────────────────────────────────
const ORBIT_PANELS = [
  { id:"ats", label:"ATS Score", value:"98%", color:"#10b981", top:"4%", left:"-10%", duration:7 },
  { id:"gap", label:"Skill Gap", value:"2 gaps", color:"#f59e0b", top:"14%", right:"-12%", duration:8.5 },
  { id:"match", label:"Job Match", value:"92%", color:"#06b6d4", bottom:"24%", right:"-15%", duration:6.5 },
  { id:"suggest", label:"AI Enhancer", value:"14 tips", color:"#8b5cf6", bottom:"2%", left:"-10%", duration:9 },
  { id:"interview", label:"Interview Prep", value:"Ready", color:"#f43f5e", top:"52%", right:"-18%", duration:7.5 },
  { id:"rank", label:"Top Ranking", value:"Top 2%", color:"#6366f1", top:"60%", left:"-15%", duration:8 },
];

function HeroDashboard3D() {
  const stageRef = useRef(null);
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mvY, [-0.5, 0.5], [8, -8]), { stiffness: 100, damping: 20 });
  const rotateY = useSpring(useTransform(mvX, [-0.5, 0.5], [-10, 10]), { stiffness: 100, damping: 20 });

  const handleMove = (e) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    mvX.set((e.clientX - rect.left) / rect.width - 0.5);
    mvY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => { mvX.set(0); mvY.set(0); };

  const bars = [
    { label: "Skills Match Quality", pct: 88, color: "#6366f1" },
    { label: "Experience Impact", pct: 79, color: "#10b981" },
    { label: "Keyword Density", pct: 92, color: "#f59e0b" },
  ];

  return (
    <motion.div
      className="hero-3d-wrap"
      ref={stageRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      initial={{ opacity:0, scale:0.92, y:20 }}
      animate={{ opacity:1, scale:1, y:0 }}
      transition={{ duration:0.8, delay:0.3, ease:[0.16,1,0.3,1] }}
    >
      <div className="hero-3d-cursor-glow" />
      <motion.div className="hero-3d-stage" style={{ rotateX, rotateY }}>
        <svg className="hero-3d-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          {ORBIT_PANELS.map((p, i) => {
            const x2 = p.left ? 8 : 92;
            const y2 = p.top ? parseFloat(p.top) + 8 : 100 - parseFloat(p.bottom) - 8;
            return (
              <motion.line key={p.id} x1="50" y1="50" x2={x2} y2={y2} stroke={p.color} strokeWidth="0.4" strokeDasharray="2 2"
                initial={{ opacity:0 }} animate={{ opacity:0.4 }} transition={{ delay:0.6 + i * 0.1, duration:0.5 }} />
            );
          })}
        </svg>

        <div className="hero-3d-core">
          <div className="core-header">
            <span className="core-title"><Icon.File /> AI Resume Intelligence Core</span>
            <span className="core-live"><span className="core-live-dot" />Live Evaluation</span>
          </div>
          <div className="core-score-row">
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>OVERALL READINESS SCORE</div>
              <span className="core-score">84<span>/100</span></span>
            </div>
            <div className="core-score-ring">
              <svg viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                <motion.circle cx="20" cy="20" r="17" fill="none" stroke="#6366f1" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 17}
                  initial={{ strokeDashoffset: 2 * Math.PI * 17 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 17 * (1 - 0.84) }}
                  transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                  transform="rotate(-90 20 20)"
                />
              </svg>
            </div>
          </div>
          {bars.map((b, i) => (
            <div className="core-bar-row" key={b.label}>
              <div className="core-bar-top"><span>{b.label}</span><span>{b.pct}%</span></div>
              <div className="core-bar-track">
                <motion.div className="core-bar-fill" style={{ background:b.color }}
                  initial={{ width:0 }} animate={{ width:`${b.pct}%` }} transition={{ duration:1, delay:0.6 + i * 0.1, ease:"easeOut" }} />
              </div>
            </div>
          ))}
          <div className="core-missing">
            <span className="core-missing-label">Critical Optimization Flags</span>
            <div className="core-missing-tags">
              {["System Architecture", "GraphQL", "Kubernetes"].map((s) => <span key={s} className="tag-missing">{s}</span>)}
            </div>
          </div>
        </div>

        {ORBIT_PANELS.map((p, i) => (
          <motion.div key={p.id} className="hero-orbit-panel"
            style={{ top:p.top, bottom:p.bottom, left:p.left, right:p.right, "--panel-color": p.color }}
            initial={{ opacity:0, scale:0.7 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.8 + i * 0.1, duration:0.4 }}>
            <span className="hero-orbit-dot" />
            <div className="hero-orbit-label">{p.label}</div>
            <div className="hero-orbit-value">{p.value}</div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

// ─── Hero Component ───────────────────────────────────────────────────────────
function Hero() {
  const navigate = useNavigate();
  return (
    <section className="hero">
      <ParticleCanvas />
      <div className="hero-grid" />
      <div className="hero-orb-1" /><div className="hero-orb-2" />
      <div className="hero-inner">
        <div className="hero-copy">
          <motion.div className="hero-eyebrow" initial={{ opacity:0, y:-15 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
            <div className="badge-dot" /> Next-Generation AI Recruitment & Resume Intelligence <Icon.Sparkles />
          </motion.div>
          <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.1 }}>
            Accelerate Your Career <br /><span className="highlight">With Autonomous AI</span>
          </motion.h1>
          <motion.p className="hero-sub" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.6, delay:0.2 }}>
            Upload your resume, execute instant semantic ATS checks, benchmark against any job description, and secure 3.2× more elite interview callbacks.
          </motion.p>
          <motion.div className="hero-ctas" initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.3 }}>
            <button className="btn-primary-lg" onClick={() => navigate("/resume-analyzer")}><Icon.Upload /> Upload Resume Free</button>
            <button className="btn-secondary-lg" onClick={() => navigate("/recruiter")}>Recruiter Command Center →</button>
          </motion.div>
          <motion.div className="hero-stats" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.5, delay:0.4 }}>
            {[
              { value:"50", suffix:"k+", label:"Resumes Optimized" },
              { value:"3.2", suffix:"×", label:"Interview Callback Lift" },
              { value:"98", suffix:"%", label:"ATS Clearance Rate" },
            ].map((s) => (
              <div className="stat" key={s.label}>
                <span className="stat-num"><AnimNum value={s.value} suffix={s.suffix} /></span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
        <div className="hero-visual">
          <HeroDashboard3D />
        </div>
      </div>
    </section>
  );
}

// ─── Animated Product Demo Section ────────────────────────────────────────────
const DEMO_STEPS = [
  { id:"upload", label:"Resume Upload", icon:<Icon.Upload/> },
  { id:"scan", label:"Deep AI Scan", icon:<Icon.Brain/> },
  { id:"score", label:"Scoring Engine", icon:<Icon.Target/> },
  { id:"gap", label:"Skill Gap Finder", icon:<Icon.X/> },
  { id:"suggest", label:"Bullet Enhancer", icon:<Icon.Sparkles/> },
  { id:"match", label:"JD Matching", icon:<Icon.Check/> },
  { id:"prep", label:"Interview Simulator", icon:<Icon.Rocket/> },
];

function ProductDemo() {
  const [step, setStep] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:"-80px" });

  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setStep((s) => (s + 1) % DEMO_STEPS.length), 2400);
    return () => clearInterval(t);
  }, [inView]);

  const cur = DEMO_STEPS[step].id;

  return (
    <section className="product-demo" ref={ref}>
      <div className="section-wrap" style={{ textAlign: "center" }}>
        <div className="section-label" style={{ justifyContent: "center" }}>Live Product Simulation</div>
        <h2 className="section-title">Watch HireBot <em>Think & Optimize</em> In Real-Time</h2>
        <p className="section-sub" style={{ marginInline: "auto" }}>One document upload triggers seven automated micro-engines to restructure your professional profile.</p>

        <div className="demo-rail">
          {DEMO_STEPS.map((s, i) => (
            <div key={s.id} className={`demo-rail-step ${i === step ? "active" : ""} ${i < step ? "done" : ""}`} onClick={() => setStep(i)}>
              <div className="demo-rail-icon">{s.icon}</div>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="demo-stage">
          <AnimatePresence mode="wait">
            {cur === "upload" && (
              <motion.div key="upload" className="demo-frame" {...demoAnim}>
                <div className="demo-doc-drop">
                  <motion.div className="demo-doc" initial={{ y:-20, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ duration:0.4 }}>
                    <Icon.File /> senior_engineer_resume_2026.pdf
                  </motion.div>
                  <div className="demo-drop-label">Secure document ingestion & vector embedding active...</div>
                </div>
              </motion.div>
            )}
            {cur === "scan" && (
              <motion.div key="scan" className="demo-frame" {...demoAnim}>
                <div className="demo-scan-doc">
                  <Icon.File />
                  <motion.div className="demo-scan-beam" initial={{ top:"0%" }} animate={{ top:"100%" }} transition={{ duration:1.5, repeat:Infinity, ease:"linear" }} />
                  <span>Parsing syntax, typography hierarchy, and skill taxonomy…</span>
                </div>
              </motion.div>
            )}
            {cur === "score" && (
              <motion.div key="score" className="demo-frame" {...demoAnim}>
                <div className="demo-score-pop">
                  <motion.span initial={{ scale:0.5, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ type:"spring", stiffness:200, damping:12 }}>84</motion.span>
                  <small>/100</small>
                </div>
                <div className="demo-score-breakdown">
                  {[["Skills Match","88%","#6366f1"],["Experience","79%","#10b981"],["Keywords","92%","#f59e0b"]].map(([l,v,c]) => (
                    <div key={l} className="demo-chip" style={{ borderColor:`${c}55`, color:c }}>{l} {v}</div>
                  ))}
                </div>
              </motion.div>
            )}
            {cur === "gap" && (
              <motion.div key="gap" className="demo-frame" {...demoAnim}>
                <div className="demo-gap-list">
                  {["System Architecture", "GraphQL", "Kubernetes"].map((s, i) => (
                    <motion.span key={s} className="tag-missing" initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i * 0.15 }}>{s}</motion.span>
                  ))}
                </div>
                <div className="demo-drop-label">3 high-priority technical competencies missing against targeted JD</div>
              </motion.div>
            )}
            {cur === "suggest" && (
              <motion.div key="suggest" className="demo-frame" {...demoAnim}>
                <div className="demo-suggest">
                  <div className="demo-suggest-before">Worked on the backend database and wrote API endpoints</div>
                  <Icon.ArrowDown />
                  <motion.div className="demo-suggest-after" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}>
                    Architected scalable Node.js microservices handling 2.5M+ daily requests with 99.99% uptime.
                  </motion.div>
                </div>
              </motion.div>
            )}
            {cur === "match" && (
              <motion.div key="match" className="demo-frame" {...demoAnim}>
                <div className="demo-match-ring">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                    <motion.circle cx="50" cy="50" r="42" fill="none" stroke="#06b6d4" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 42} initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - 0.92) }} transition={{ duration:1 }}
                      transform="rotate(-90 50 50)" />
                  </svg>
                  <div className="demo-match-num">92%</div>
                </div>
                <div className="demo-drop-label">Semantic Match Verification with Senior Engineering Role</div>
              </motion.div>
            )}
            {cur === "prep" && (
              <motion.div key="prep" className="demo-frame" {...demoAnim}>
                <div className="interview-q" style={{ borderLeftColor:"#f43f5e", textAlign: "left" }}>
                  <div className="interview-q-type" style={{ color:"#f43f5e" }}>Technical Simulator Prompt</div>
                  <div className="interview-q-text">Explain React fiber reconciliation mechanics and when to apply useMemo vs useCallback.</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
const demoAnim = { initial:{ opacity:0, y:15 }, animate:{ opacity:1, y:0 }, exit:{ opacity:0, y:-15 }, transition:{ duration:0.3 } };

// ─── Pain Points Component ───────────────────────────────────────────────────
function SeekerMiniVisual() {
  return (
    <div className="pain-visual">
      <motion.div className="pain-doc" initial={{ y:-5, opacity:0 }} whileInView={{ y:0, opacity:1 }} viewport={{ once:true }} transition={{ duration:0.4 }}>
        <Icon.File /> resume.pdf
      </motion.div>
      <div className="pain-filter">ATS Screened Out</div>
      <motion.div className="pain-reject" initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay:0.5 }}>
        Zero callbacks
      </motion.div>
    </div>
  );
}
function RecruiterMiniVisual() {
  return (
    <div className="pain-visual pain-visual--stack">
      {[0,1,2,3].map((i) => (
        <motion.div key={i} className="pain-doc-stack" style={{ zIndex:4-i }}
          initial={{ y:-12 - i*3, opacity:0, rotate:(i-1.5)*3 }}
          whileInView={{ y:i*3, opacity:1, rotate:(i-1.5)*3 }}
          viewport={{ once:true }} transition={{ delay:i*0.1, duration:0.3 }} />
      ))}
      <div className="pain-drown-label">250+ Unread CVs</div>
    </div>
  );
}

function PainPoints() {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:"-60px" });
  const cards = [
    { cls:"seeker", icon:"🎯", heading:"For Ambitious Job Seekers", dotColor:"#f43f5e",
      items:[
        "Traditional resumes fail to emphasize unique technical impact",
        "Rigid ATS filters reject over 75% of candidates sight unseen",
        "Zero visibility into exact missing skill competencies for targeted roles",
        "Ineffective interview preparation without customized question banks",
        "Endless job applications resulting in ghosting and silence"
      ],
      visual: <SeekerMiniVisual /> },
    { cls:"recruiter", icon:"🏢", heading:"For Modern HR & Engineering Teams", dotColor:"#f59e0b",
      items:[
        "Screening hundreds of unstructured applicant resumes burns team hours",
        "Difficulty in quickly surfacing top-tier technical match candidates",
        "Unconscious human screening bias during initial review phases",
        "Poor job requisition descriptions attracting unqualified volume",
        "Exceptional talent regularly lost in high-volume candidate noise"
      ],
      visual: <RecruiterMiniVisual /> },
  ];
  return (
    <section style={{ padding: "6rem 0" }} ref={ref}>
      <div className="section-wrap">
        <div className="section-label">Friction Analysis</div>
        <h2 className="section-title">Why Traditional Hiring <em>Is Broken</em></h2>
        <p className="section-sub">Both candidates and recruiters experience immense systemic friction. HireBot replaces guesswork with autonomous AI clarity.</p>
        <div className="pain-grid">
          {cards.map((card, i) => (
            <motion.div key={card.cls} className={`pain-card ${card.cls}`}
              initial={{ opacity:0, y:25 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.5, delay:i * 0.15 }}>
              <div className="pain-card-top">
                <div>
                  <span className="pain-icon">{card.icon}</span>
                  <div className="pain-heading">{card.heading}</div>
                </div>
                {card.visual}
              </div>
              <ul className="pain-list">
                {card.items.map((item) => (
                  <li key={item}><div className="pain-dot" style={{ background:card.dotColor }} />{item}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── "HireBot Changes The Game" Component ─────────────────────────────────────
function ChangesGame() {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:"-80px" });
  const before = ["Manual resume sorting", "Unoptimized keywords", "Generic interview prep", "High recruiter bias"];
  const after  = ["Autonomous AI ranking", "Semantic JD matching", "Custom simulation", "Objective shortlisting"];
  return (
    <section className="changes-game" ref={ref}>
      <div className="section-wrap" style={{ textAlign: "center" }}>
        <div className="section-label" style={{ justifyContent: "center" }}>Paradigm Shift</div>
        <h2 className="section-title">How HireBot Rewrites <em>The Rules</em></h2>
        <p className="section-sub" style={{ marginInline: "auto" }}>Transforming chaotic recruitment workflows into high-precision, intelligent pipelines.</p>
        <div className="cg-row" style={{ marginTop: "3rem" }}>
          <div className="cg-col cg-before" style={{ textAlign: "left" }}>
            <div className="cg-col-label">Legacy Workflow</div>
            {before.map((t, i) => (
              <motion.div key={t} className="cg-item cg-item--before"
                initial={{ opacity:0, x:-15 }} animate={inView ? { opacity:1, x:0 } : {}} transition={{ delay:i*0.08 }}>
                ✕ {t}
              </motion.div>
            ))}
          </div>
          <motion.div className="cg-core" initial={{ scale:0.6, opacity:0 }} animate={inView ? { scale:1, opacity:1 } : {}} transition={{ duration:0.5, delay:0.3, type:"spring" }}>
            <HireBotLogo size={44} showText={false} variant="glow" />
          </motion.div>
          <div className="cg-col cg-after" style={{ textAlign: "left" }}>
            <div className="cg-col-label">HireBot AI Pipeline</div>
            {after.map((t, i) => (
              <motion.div key={t} className="cg-item cg-item--after"
                initial={{ opacity:0, x:15 }} animate={inView ? { opacity:1, x:0 } : {}} transition={{ delay:0.5 + i*0.08 }}>
                ✓ {t}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── How It Works Component ──────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { num:"01", color:"#6366f1", bg:"rgba(99,102,241,0.12)", icon:<Icon.Upload />, title:"Ingest & Parse Profile", desc:"Drop any PDF or Word resume. Our neural parser extracts formatting, timeline history, and skill taxonomy instantly." },
    { num:"02", color:"#10b981", bg:"rgba(16,185,129,0.12)", icon:<Icon.Brain />, title:"AI Diagnostic & Scoring", desc:"Receive an instant 0–100 score, ATS compatibility report, and precise skill gap analysis mapped against targeted roles." },
    { num:"03", color:"#f59e0b", bg:"rgba(245,158,11,0.12)", icon:<Icon.Rocket />, title:"Optimize & Apply", desc:"Apply AI bullet rewriters, simulate technical interview questions, and submit fully optimized applications with absolute confidence." },
  ];
  return (
    <section className="how-it-works" style={{ padding: "6rem 0" }}>
      <div className="section-wrap">
        <div className="section-label">Operational Blueprint</div>
        <h2 className="section-title">Three Steps To <em>Career Acceleration</em></h2>
        <p className="section-sub">From initial document upload to final interview offer, HireBot handles the complex mechanics.</p>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <motion.div key={s.num} className="step-card"
              initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:i * 0.15 }}>
              <div className="step-num" style={{ color:s.color }}>{s.num}</div>
              <div className="step-icon" style={{ background:s.bg, color:s.color }}>{s.icon}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Feature Showcase Component ──────────────────────────────────────────────
function FeatureShowcase() {
  const [active, setActive] = useState("score");
  const feat = FEATURES.find((f) => f.id === active);
  const MockComp = MOCK_MAP[active];
  return (
    <section className="feature-showcase">
      <div className="section-wrap">
        <div className="section-label">Feature Matrix</div>
        <h2 className="section-title">Engineered For <em>Absolute Dominance</em></h2>
        <p className="section-sub">Explore the core modules powering HireBot's resume intelligence and recruitment suite.</p>
        <div className="fs-tabs">
          {FEATURES.map((f) => (
            <motion.button key={f.id} className={`fs-tab ${active === f.id ? "active" : ""}`}
              style={active === f.id ? { background: f.color, borderColor: f.color } : {}}
              onClick={() => setActive(f.id)} whileTap={{ scale: 0.96 }}>
              {f.label}
            </motion.button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={active} className="fs-display"
            initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-15 }} transition={{ duration:0.3 }}>
            <div className="fs-visual" style={{ background: feat.bgAlpha, borderColor: feat.borderAlpha }}>
              <MockComp color={feat.color} />
            </div>
            <div className="fs-content">
              <div className="fs-badge" style={{ background: feat.badgeBg, color: feat.badgeColor }}>
                <span className="fs-badge-dot" style={{ background: feat.badgeColor }} /> {feat.label} Module
              </div>
              <h3 className="fs-title">{feat.title}</h3>
              <p className="fs-desc">{feat.desc}</p>
              <ul className="fs-bullets">
                {feat.bullets.map((b) => (
                  <li key={b}>
                    <div className="fs-check" style={{ background: `${feat.color}20`, color: feat.badgeColor }}><Icon.Check /></div>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── Resume vs Job Description Interaction Component ─────────────────────────
function ResumeVsJD() {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:"-80px" });
  const rows = [
    { label: "Core Competency Alignment", pct: 94, color: "#6366f1" },
    { label: "Seniority & Impact Match", pct: 89, color: "#10b981" },
    { label: "Technical Keyword Density", pct: 91, color: "#06b6d4" },
  ];
  return (
    <section className="rvj" ref={ref}>
      <div className="section-wrap">
        <div className="section-label">Vector Matching Engine</div>
        <h2 className="section-title">Resume Versus <em>Job Description</em></h2>
        <p className="section-sub">Our neural comparison engine analyzes both documents side-by-side to compute precise semantic fit.</p>

        <div className="rvj-stage">
          <motion.div className="rvj-panel" initial={{ opacity:0, x:-20 }} animate={inView ? { opacity:1, x:0 } : {}} transition={{ duration:0.5 }}>
            <div className="rvj-panel-label"><Icon.File /> Candidate Resume Vector</div>
            <div className="rvj-panel-lines">
              {[100, 80, 90, 65, 75].map((w, i) => <span key={i} style={{ width: `${w}%` }} />)}
            </div>
          </motion.div>

          <div className="rvj-ai">
            <motion.div className="rvj-ai-core" initial={{ scale:0.6, opacity:0 }} animate={inView ? { scale:1, opacity:1 } : {}} transition={{ delay:0.2, type:"spring" }}>
              <Icon.Brain />
            </motion.div>
            <svg className="rvj-beam" viewBox="0 0 200 40" preserveAspectRatio="none">
              <motion.line x1="0" y1="20" x2="200" y2="20" stroke="url(#rvjGrad)" strokeWidth="2" strokeDasharray="4 4"
                initial={{ pathLength:0 }} animate={inView ? { pathLength:1 } : {}} transition={{ duration:1, delay:0.4 }} />
              <defs>
                <linearGradient id="rvjGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <motion.div className="rvj-panel" initial={{ opacity:0, x:20 }} animate={inView ? { opacity:1, x:0 } : {}} transition={{ duration:0.5 }}>
            <div className="rvj-panel-label"><Icon.Target /> Target Requisition JD</div>
            <div className="rvj-panel-lines rvj-panel-lines--alt">
              {[95, 85, 90, 70, 60].map((w, i) => <span key={i} style={{ width: `${w}%` }} />)}
            </div>
          </motion.div>
        </div>

        <motion.div className="rvj-result" initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ delay:0.6, duration:0.5 }}>
          <div className="rvj-result-score">
            <span>91%</span>
            <small>Overall Vector Match</small>
          </div>
          <div className="rvj-result-bars">
            {rows.map((r, i) => (
              <div className="rvj-bar-row" key={r.label}>
                <div className="rvj-bar-top"><span>{r.label}</span><span>{r.pct}%</span></div>
                <div className="rvj-bar-track">
                  <motion.div className="rvj-bar-fill" style={{ background: r.color }}
                    initial={{ width: 0 }} animate={inView ? { width: `${r.pct}%` } : {}} transition={{ duration: 1, delay: 0.7 + i * 0.1 }} />
                </div>
              </div>
            ))}
          </div>
          <div className="rvj-result-tags">
            <span className="rvj-result-tags-label">AI Recommended Enhancements</span>
            <div>
              {["Highlight Kubernetes deployment", "Quantify team leadership scale", "Align terminology with JD"].map((t) => (
                <span key={t} className="tag-improve">{t}</span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Pricing Preview Component ───────────────────────────────────────────────
function PricingPreview() {
  const navigate = useNavigate();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="pricing-preview" ref={ref}>
      <div className="pricing-preview__orb pricing-preview__orb--1" />
      <div className="pricing-preview__orb pricing-preview__orb--2" />
      <div className="section-wrap" style={{ position: "relative", zIndex: 1 }}>
        <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.5 }}>
          <div className="section-label">Transparent Investment</div>
          <h2 className="section-title">Start Free. <em>Scale When Ready.</em></h2>
          <p className="section-sub">No recurring traps, no hidden charges. Choose the tier that matches your career acceleration.</p>
        </motion.div>
        <div className="lp-plans-grid">
          {LANDING_PLANS.map((plan, i) => (
            <motion.div key={plan.key}
              className={`lp-plan-card ${plan.highlight ? "lp-plan-card--featured" : ""}`}
              initial={{ opacity:0, y:30 }}
              animate={inView ? { opacity:1, y:0 } : {}}
              transition={{ duration:0.5, delay:0.1 + i * 0.1 }}
              style={{ "--plan-color": plan.color }}
            >
              {plan.highlight && <div className="lp-plan-card__ring" />}
              {plan.badge && (
                <div className={`lp-plan-badge ${plan.key === "pro_annual" ? "lp-plan-badge--gold" : ""}`}>
                  {plan.key === "pro_monthly" && <Icon.Zap />}
                  {plan.badge}
                </div>
              )}
              <div className="lp-plan-head">
                <h3 className="lp-plan-name">{plan.name}</h3>
                <div className="lp-plan-price">
                  <span className="lp-plan-amount">{plan.price}</span>
                  <span className="lp-plan-period">{plan.period}</span>
                </div>
              </div>
              <div className="lp-plan-divider" />
              <ul className="lp-plan-features">
                {plan.features.map((f, fi) => (
                  <motion.li key={fi}
                    className={`lp-plan-feature ${!f.ok ? "lp-plan-feature--off" : ""}`}
                    initial={{ opacity:0, x:-5 }} animate={inView ? { opacity:1, x:0 } : {}}
                    transition={{ delay: 0.2 + i * 0.1 + fi * 0.03 }}
                  >
                    <div className="lp-feature-icon" style={{ background: f.ok ? `${plan.color}20` : "rgba(255,255,255,0.03)", color: f.ok ? plan.color : "#475569" }}>
                      {f.ok ? <Icon.Check /> : <Icon.X />}
                    </div>
                    {f.text}
                  </motion.li>
                ))}
              </ul>
              <button
                className={`lp-plan-cta ${plan.highlight ? "lp-plan-cta--primary" : ""}`}
                onClick={() => navigate(plan.key === "free" ? "/register" : "/pricing")}
              >
                {plan.cta}
                {plan.key !== "free" && <span className="lp-plan-cta-arrow">→</span>}
              </button>
              {plan.key === "pro_monthly" && (
                <p className="lp-plan-note">
                  <Icon.Shield /> Razorpay secured · Instant activation
                </p>
              )}
            </motion.div>
          ))}
        </div>
        <motion.div className="pricing-preview__footer"
          initial={{ opacity:0 }} animate={inView ? { opacity:1 } : {}} transition={{ delay:0.5 }}>
          <span>Looking for enterprise team recruitment licenses?</span>
          <button className="pricing-preview__link" onClick={() => navigate("/pricing")}>
            Contact sales & team desk <Icon.ArrowRight />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

// ─── User Journey Component ──────────────────────────────────────────────────
function Journey() {
  const steps = [
    { color:"#6366f1", title:"1. Land & Explore", desc:"Arrive at HireBot and instantly evaluate our interactive AI resume diagnostic core." },
    { color:"#10b981", title:"2. Ingest Resume", desc:"Upload your CV in seconds. Our parser extracts all professional history and technical skills." },
    { color:"#f59e0b", title:"3. Diagnostic & Score", desc:"Review your 0–100 score, identify exact skill gaps, and view ATS compatibility flags." },
    { color:"#8b5cf6", title:"4. Apply AI Fixes", desc:"Trigger our automated bullet rewriter and tailor your resume against specific target job descriptions." },
    { color:"#f43f5e", title:"5. Interview Simulation", desc:"Prepare using AI-generated technical and behavioral questions tailored directly to your profile." },
    { color:"#10b981", title:"6. Interview & Hired", desc:"Submit optimized applications and secure 3.2× more elite interview callbacks and offers." },
  ];
  return (
    <section style={{ padding: "6rem 0" }}>
      <div className="section-wrap">
        <div className="section-label">User Lifecycle</div>
        <h2 className="section-title">Your Journey From <em>Visitor to Hired</em></h2>
        <p className="section-sub">A seamless, step-by-step transformation designed to elevate your professional trajectory.</p>
        <div className="journey-flow">
          {steps.map((s, i) => (
            <motion.div key={s.title} className="journey-step"
              initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.4, delay:i * 0.08 }}>
              <div className="j-num" style={{ borderColor:s.color, color:s.color, background:`${s.color}15` }}>{i + 1}</div>
              <div className="j-content">
                <div className="j-title">{s.title}</div>
                <div className="j-desc">{s.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials Component ──────────────────────────────────────────────────
function Testimonials() {
  const cards = [
    { stars:5, text:"I applied to 40 software engineering roles with my old resume and received zero callbacks. After running HireBot's ATS optimizer and bullet rewriter, I secured 5 elite interview invites in one week.", name:"Priya Mehta", role:"Senior Frontend Engineer", initials:"PM", bg:"rgba(99,102,241,0.2)", c:"#a5b4fc" },
    { stars:5, text:"The skill gap analysis is an absolute game-changer. It told me precisely which cloud certifications and keywords were missing for target DevOps roles before I applied.", name:"James O'Connor", role:"Data & Cloud Analyst", initials:"JO", bg:"rgba(139,92,246,0.2)", c:"#c4b5fd" },
    { stars:5, text:"As an HR lead managing technical recruitment, HireBot's candidate ranking dashboard reduced our initial screening bottleneck from 3 hours down to 15 minutes per requisition.", name:"Anita Shah", role:"Head of Talent @ TechCorp", initials:"AS", bg:"rgba(16,185,129,0.2)", c:"#6ee7b7" },
  ];
  return (
    <section className="testimonials">
      <div className="section-wrap">
        <div className="section-label">Success Stories</div>
        <h2 className="section-title">Trusted By <em>Ambitious Professionals</em></h2>
        <p className="section-sub">See how job seekers and recruitment teams accelerate their success with HireBot.</p>
        <div className="testi-grid">
          {cards.map((c, idx) => (
            <motion.div key={c.name} className="testi-card"
              initial={{ opacity:0, y:25 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.4, delay:idx * 0.1 }}>
              <div className="stars">{"★".repeat(c.stars)}</div>
              <div className="testi-text">"{c.text}"</div>
              <div className="testi-author">
                <div className="testi-avatar" style={{ background:c.bg, color:c.c }}>{c.initials}</div>
                <div><div className="testi-name">{c.name}</div><div className="testi-role">{c.role}</div></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Recruiter Dashboard Component ────────────────────────────────────────────
function RecruiterDashboard() {
  const navigate = useNavigate();
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:"-80px" });
  const cands = [
    { name:"Sarah Jenkins", role:"React · Node · AWS", score:96, flag:null, initials:"SJ", bg:"rgba(16,185,129,0.2)", c:"#6ee7b7" },
    { name:"Marcus Chen", role:"Vue · Python · Docker", score:91, flag:null, initials:"MC", bg:"rgba(99,102,241,0.2)", c:"#a5b4fc" },
    { name:"Elena Rostova", role:"Angular · Java · K8s", score:88, flag:null, initials:"ER", bg:"rgba(139,92,246,0.2)", c:"#c4b5fd" },
    { name:"Liam O'Connor", role:"React · GraphQL · Go", score:74, flag:"Minor Skill Gap", initials:"LO", bg:"rgba(245,158,11,0.2)", c:"#fbbf24" },
  ];
  return (
    <section className="recruiter-dash" ref={ref}>
      <div className="section-wrap">
        <div className="rd-grid">
          <motion.div initial={{ opacity:0, x:-20 }} animate={inView ? { opacity:1, x:0 } : {}} transition={{ duration:0.5 }}>
            <div className="section-label">Recruiter Command Center</div>
            <h2 className="section-title">Stop Drowning In <em>Unstructured Resumes</em></h2>
            <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
              Post any job requisition and let HireBot's neural ranking engine automatically score, rank, and summarize every applicant. Surface top-tier talent instantly with zero hiring bias.
            </p>
            <div className="rs-tags">
              {["Autonomous Ranking", "Match Score Matrix", "Bias Reduction", "JD Optimization"].map((t) => <span key={t} className="rs-tag">{t}</span>)}
            </div>
            <button className="rs-btn" onClick={() => navigate("/recruiter")}>Post Requisition & Screen →</button>
          </motion.div>

          <motion.div className="rd-panel" initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.5, delay:0.15 }}>
            <div className="rd-panel-header">
              <span>Active Requisition: Senior Full-Stack (184 Applicants)</span>
              <span className="rd-panel-live"><span className="core-live-dot" />AI Sorted</span>
            </div>
            <div className="rd-panel-list">
              {cands.map((c, i) => (
                <motion.div key={c.name} className="rd-cand"
                  initial={{ opacity:0, y:10 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ delay:0.3 + i*0.1, duration:0.3 }}>
                  <div className="rank-avatar" style={{ background:c.bg, color:c.c }}>{c.initials}</div>
                  <div className="rank-info">
                    <div className="rank-name">{c.name}</div>
                    <div className="rank-role">{c.role}</div>
                  </div>
                  {c.flag && <span className="rd-flag">{c.flag}</span>}
                  <div className="rd-score" style={{ color: c.score >= 85 ? "#10b981" : "#f59e0b" }}>{c.score}%</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA Banner Component ──────────────────────────────────────────────
function CTABanner() {
  const navigate = useNavigate();
  const journey = [
    { icon:<Icon.File />, label:"Resume" },
    { icon:<Icon.Brain />, label:"AI Analysis" },
    { icon:<Icon.Target />, label:"91% Match" },
    { icon:<Icon.Rocket />, label:"Interview" },
    { icon:"🎉", label:"Hired" },
  ];
  return (
    <div className="cta-banner-section">
      <motion.div className="cta-inner" initial={{ opacity:0, scale:0.95 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }} transition={{ duration:0.5 }}>
        <div className="cta-journey">
          {journey.map((j, i) => (
            <React.Fragment key={j.label}>
              <motion.div className="cta-journey-node" initial={{ opacity:0, y:10 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }}>
                <span className="cta-journey-icon">{j.icon}</span>
                <span className="cta-journey-label">{j.label}</span>
              </motion.div>
              {i < journey.length - 1 && <span className="cta-journey-arrow">→</span>}
            </React.Fragment>
          ))}
        </div>
        <h2>Ready To Secure Your <em>Next Big Career Move?</em></h2>
        <p>Join over 50,000+ ambitious job seekers and recruitment teams using HireBot to eliminate friction and hire smarter.</p>
        <div className="cta-btns">
          <button className="btn-white" onClick={() => navigate("/resume-analyzer")}>Upload Resume — Free</button>
          <button className="btn-outline-white" onClick={() => navigate("/demo")}>Explore Product Demo</button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Footer Component ─────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="landing-footer">
      <div className="footer-logo">
        <div className="footer-logo-mark">H</div>
        <div className="logo-main">HireBot<span style={{ color: "#38bdf8", fontFamily: "var(--font-mono)", fontSize: 11, marginLeft: 2 }}>AI</span></div>
      </div>
      <div className="footer-links">
        {["Privacy Policy","Terms of Service","Security & Compliance","Pricing","Contact Desk"].map((l) => <span key={l}>{l}</span>)}
      </div>
      <div style={{ fontSize:12, color:"var(--text-muted)" }}>© 2026 HireBot AI Systems. All rights reserved.</div>
    </footer>
  );
}

// ─── Main Export Component ────────────────────────────────────────────────────
export default function HirebotLanding() {
  return (
    <div className="landing">
      <ScrollProgress />
      <Navbar />
      <Hero />
      <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: 0 }} />
      <ProductDemo />
      <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: 0 }} />
      <PainPoints />
      <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: 0 }} />
      <ChangesGame />
      <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: 0 }} />
      <HowItWorks />
      <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: 0 }} />
      <FeatureShowcase />
      <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: 0 }} />
      <ResumeVsJD />
      <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: 0 }} />
      <PricingPreview />
      <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: 0 }} />
      <Journey />
      <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: 0 }} />
      <Testimonials />
      <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: 0 }} />
      <RecruiterDashboard />
      <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: 0 }} />
      <CTABanner />
      <Footer />
    </div>
  );
}