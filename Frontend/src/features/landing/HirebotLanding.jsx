import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import "../landing/styles/landing.scss";

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  Upload: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  Brain: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
    </svg>
  ),
  Rocket: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  ),
  Menu: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  Check: () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ),
  Sparkles: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/>
      <path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z"/>
    </svg>
  ),
};

// ─── Feature Config ───────────────────────────────────────────────────────────
const FEATURES = [
  {
    id:"score", label:"Resume Score", color:"#4f46e5",
    bgAlpha:"rgba(79,70,229,0.1)", borderAlpha:"rgba(79,70,229,0.2)",
    badgeBg:"rgba(79,70,229,0.15)", badgeColor:"#a5b4fc",
    title:"Instant AI Resume Score",
    desc:"Get a precise 0–100 score analyzing every aspect of your resume — skills, experience, and keyword density — all in seconds.",
    bullets:["ATS compatibility check","Section-by-section breakdown","Benchmark vs. top candidates","Real-time score updates"],
  },
  {
    id:"ats", label:"ATS Optimizer", color:"#10b981",
    bgAlpha:"rgba(16,185,129,0.08)", borderAlpha:"rgba(16,185,129,0.2)",
    badgeBg:"rgba(16,185,129,0.12)", badgeColor:"#6ee7b7",
    title:"Pass ATS Filters Every Time",
    desc:"Most resumes never reach a human. Our AI checks formatting, keywords, and structure so your resume clears automated screening systems.",
    bullets:["Keyword density analysis","Format compatibility check","Font & structure validation","Recruiter-friendly layout tips"],
  },
  {
    id:"gap", label:"Skill Gap", color:"#f59e0b",
    bgAlpha:"rgba(245,158,11,0.08)", borderAlpha:"rgba(245,158,11,0.2)",
    badgeBg:"rgba(245,158,11,0.12)", badgeColor:"#fbbf24",
    title:"Know Exactly What You're Missing",
    desc:"Paste any job description and see side-by-side which skills you have and which you need — with learning recommendations.",
    bullets:["Job description matching","Missing skills highlighted","Learning resource links","Priority skill ranking"],
  },
  {
    id:"suggest", label:"AI Suggestions", color:"#7c3aed",
    bgAlpha:"rgba(124,58,237,0.08)", borderAlpha:"rgba(124,58,237,0.2)",
    badgeBg:"rgba(124,58,237,0.12)", badgeColor:"#c4b5fd",
    title:"Rewrite Your Resume With AI",
    desc:"Vague bullet points kill interviews. Our AI rewrites weak lines with strong, metric-driven statements tailored to your target role.",
    bullets:["Bullet point rewrites","Action verb suggestions","Quantify achievements","Role-specific tailoring"],
  },
  {
    id:"interview", label:"Interview Prep", color:"#f43f5e",
    bgAlpha:"rgba(244,63,94,0.08)", borderAlpha:"rgba(244,63,94,0.2)",
    badgeBg:"rgba(244,63,94,0.12)", badgeColor:"#fda4af",
    title:"AI-Powered Interview Prep",
    desc:"Based on your resume and target role, get personalized technical and behavioral interview questions with tips on how to answer.",
    bullets:["Technical questions per stack","Behavioral STAR prompts","Company-specific research","Sample answer frameworks"],
  },
  {
    id:"ranking", label:"Smart Hiring", color:"#10b981",
    bgAlpha:"rgba(16,185,129,0.08)", borderAlpha:"rgba(16,185,129,0.2)",
    badgeBg:"rgba(16,185,129,0.12)", badgeColor:"#6ee7b7",
    title:"AI Candidate Ranking for Recruiters",
    desc:"Post a job and let AI rank every applicant with match scores, strengths, red flags, and a concise summary.",
    bullets:["Ranked candidate shortlist","Match score per JD","Strength & gap summary","Bias-reduced screening"],
  },
];

// ─── Particle Background ──────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight * 1.5;

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.alpha})`;
        ctx.fill();
      });

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${0.05 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight * 1.5;
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);

  return <canvas ref={canvasRef} className="hero-canvas" />;
}

// ─── Scroll Progress ──────────────────────────────────────────────────────────
function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop / (el.scrollHeight - el.clientHeight);
      setPct(Math.min(scrolled * 100, 100));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <div className="scroll-progress" style={{ width: `${pct}%` }} />;
}

// ─── Animated Number ──────────────────────────────────────────────────────────
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
      if (start >= num) { setDisplay(value); clearInterval(timer); }
      else setDisplay(isFloat ? start.toFixed(1) : Math.floor(start).toString());
    }, 30);
    return () => clearInterval(timer);
  }, [inView, value]);

  return <span ref={ref}>{display}{suffix}</span>;
}

// ─── Feature Mockups ──────────────────────────────────────────────────────────
function MockScore({ color }) {
  const circ = 2 * Math.PI * 52;
  const bars = [
    { label: "Skills match", pct: 82, color: "#4f46e5" },
    { label: "Experience",   pct: 74, color: "#10b981" },
    { label: "Keywords",     pct: 68, color: "#f59e0b" },
  ];
  return (
    <div className="mock-inner">
      <div className="mock-score-ring">
        <svg viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"/>
          <motion.circle cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ * (1 - 0.78) }}
            transition={{ duration: 1.6, ease: "easeOut" }}
          />
        </svg>
        <div className="mock-score-num">78</div>
      </div>
      <div className="mock-bars">
        {bars.map((b) => (
          <div className="mock-bar-row" key={b.label}>
            <div className="mock-bar-top">
              <span style={{ color:"var(--c-text2)", fontSize:11.5 }}>{b.label}</span>
              <span style={{ color:"var(--c-text1)", fontSize:11.5, fontFamily:"var(--font-mono,monospace)" }}>{b.pct}%</span>
            </div>
            <div className="mock-bar-track">
              <motion.div className="mock-bar-fill" style={{ background:b.color }}
                initial={{ width:0 }} animate={{ width:`${b.pct}%` }}
                transition={{ duration:1.2, ease:"easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop:"1px solid var(--c-border)", paddingTop:"1rem", marginTop:"1rem" }}>
        <div className="mock-missing-label">Missing skills</div>
        <div className="mock-missing-tags">
          {["Docker","Kubernetes","CI/CD"].map((s) => <span key={s} className="tag-missing">{s}</span>)}
        </div>
      </div>
    </div>
  );
}

function MockAts({ color }) {
  const checks = [
    { ok:true,  label:"Machine-readable formatting" },
    { ok:true,  label:"Standard section headers" },
    { ok:true,  label:"Keyword density optimal" },
    { ok:false, label:"Avoid tables in header area" },
    { ok:true,  label:"Font size & spacing valid" },
    { ok:false, label:"Add measurable results" },
  ];
  return (
    <div className="mock-inner">
      <div className="mock-ats-score">
        <div className="mock-ats-num" style={{ color }}>94%</div>
        <div className="mock-ats-sublabel">ATS Compatibility</div>
      </div>
      <div className="ats-checks">
        {checks.map(({ ok, label }) => (
          <div className="ats-check-row" key={label}>
            <div className="ats-check-icon"
              style={{ background:ok?"rgba(16,185,129,0.2)":"rgba(244,63,94,0.2)", color:ok?"#10b981":"#f43f5e" }}>
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
    {has:true, name:"React"},{has:true, name:"TypeScript"},{has:true, name:"Node.js"},
    {has:false,name:"Docker"},{has:true, name:"Redux"},{has:false,name:"Kubernetes"},
    {has:false,name:"GraphQL"},{has:true, name:"Git"},{has:true, name:"REST APIs"},
  ];
  return (
    <div className="mock-inner">
      <div className="gap-header">
        <div style={{ fontSize:13, fontWeight:700, color:"var(--c-text1)" }}>Skills for Senior React Dev</div>
        <div className="gap-sub">7 of 9 matched</div>
      </div>
      <div className="gap-tags">
        {skills.map(({ has, name }) => (
          <div key={name} className={`gap-tag ${has ? "gap-have" : "gap-missing"}`}>
            <div className="gap-tag-icon" style={{ background:has?"rgba(16,185,129,0.3)":"rgba(244,63,94,0.3)" }}>
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
    { before:"Helped improve code quality", after:"Led code review initiative reducing bug rate by 35% across a team of 8 engineers" },
    { before:"Worked on the backend API", after:"Architected RESTful API serving 2M+ requests/day with 99.9% uptime" },
  ];
  return (
    <div className="mock-inner">
      {sug.map((item, i) => (
        <div className="suggest-card" key={i}>
          <div className="suggest-label">Bullet {i + 1} — AI Rewrite</div>
          <div className="suggest-before">{item.before}</div>
          <div className="suggest-improved-label" style={{ color }}>▼ AI IMPROVED</div>
          <div className="suggest-after">{item.after}</div>
        </div>
      ))}
    </div>
  );
}

function MockInterview() {
  const qs = [
    { type:"Technical",    typeColor:"#4f46e5", borderColor:"#4f46e5", text:"Explain React reconciliation and when to use useCallback vs useMemo." },
    { type:"Behavioral",   typeColor:"#f59e0b", borderColor:"#f59e0b", text:"Tell me about leading a project under a tight deadline. What trade-offs did you make?" },
    { type:"System Design",typeColor:"#7c3aed", borderColor:"#7c3aed", text:"Design a URL shortener handling 100M requests/day. Walk through your architecture." },
  ];
  return (
    <div className="mock-inner">
      {qs.map((q) => (
        <div className="interview-q" key={q.type} style={{ borderLeftColor:q.borderColor }}>
          <div className="interview-q-type" style={{ color:q.typeColor }}>{q.type}</div>
          <div className="interview-q-text">{q.text}</div>
        </div>
      ))}
    </div>
  );
}

function MockRanking({ color }) {
  const cands = [
    { name:"Sarah K.", role:"React · Node · AWS",    score:94, initials:"SK", bg:"rgba(79,70,229,0.2)",  c:"#a5b4fc" },
    { name:"Raj M.",   role:"Vue · Python · Docker", score:88, initials:"RM", bg:"rgba(124,58,237,0.2)", c:"#c4b5fd" },
    { name:"Priya S.", role:"Angular · Java · K8s",  score:81, initials:"PS", bg:"rgba(16,185,129,0.2)", c:"#6ee7b7" },
    { name:"Liam O.",  role:"React · GraphQL · Go",  score:76, initials:"LO", bg:"rgba(245,158,11,0.2)", c:"#fbbf24" },
  ];
  return (
    <div className="mock-inner">
      {cands.map((c, i) => (
        <motion.div className="rank-item" key={c.name}
          initial={{ opacity:0, x:-12 }}
          animate={{ opacity:1, x:0 }}
          transition={{ delay:i * 0.1, duration:0.4 }}
        >
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

const MOCK_MAP = { score:MockScore, ats:MockAts, gap:MockGap, suggest:MockSuggest, interview:MockInterview, ranking:MockRanking };

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive:true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="landing-nav" style={{ boxShadow:scrolled?"0 4px 30px rgba(0,0,0,0.5)":"none" }}>
      <div className="nav-logo" onClick={() => navigate("/")}>
        <div className="logo-mark">H</div>
        <span className="logo-main">
          Hire<span className="logo-bold">Bot</span><span className="logo-ai">AI</span>
        </span>
      </div>

      <div className="nav-links">
        <button className="nav-link" onClick={() => navigate("/jobs")}>Explore Jobs</button>
        <button className="nav-link" onClick={() => navigate("/recruiter")}>For Recruiters</button>
        <div className="nav-divider" />
        <button className="btn-login" onClick={() => navigate("/login")}>Log in</button>
        <button className="btn-signup" onClick={() => navigate("/register")}>
          Get started free <Icon.ArrowRight />
        </button>
      </div>

      <button className="nav-hamburger"><Icon.Menu /></button>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const navigate = useNavigate();
  const bars = [
    { label:"Skills match", pct:82, color:"#4f46e5" },
    { label:"Experience",   pct:74, color:"#10b981" },
    { label:"Keywords",     pct:68, color:"#f59e0b" },
  ];

  return (
    <section>
      <div className="hero">
        <ParticleCanvas />
        <div className="hero-grid" />
        <div className="hero-orb-1" />
        <div className="hero-orb-2" />
        <div className="hero-orb-3" />

        {/* Eyebrow */}
        <motion.div className="hero-eyebrow"
          initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.55 }}>
          <div className="badge-dot" />
          AI-powered resume intelligence
          <Icon.Sparkles />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.65, delay:0.1 }}>
          Get Hired Faster<br />
          <span className="highlight">with AI Intelligence</span>
        </motion.h1>

        {/* Sub */}
        <motion.p className="hero-sub"
          initial={{ opacity:0 }} animate={{ opacity:1 }}
          transition={{ duration:0.6, delay:0.22 }}>
          Upload your resume, get an instant AI score, compare against any job
          description, and receive precise suggestions to land more interviews.
        </motion.p>

        {/* CTAs */}
        <motion.div className="hero-ctas"
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.55, delay:0.32 }}>
          <button className="btn-primary-lg" onClick={() => navigate("/resume-analyzer")}>
            <Icon.Upload /> Upload Resume
          </button>
          <button className="btn-secondary-lg" onClick={() => navigate("/recruiter")}>
            Post a Job →
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div className="hero-stats"
          initial={{ opacity:0 }} animate={{ opacity:1 }}
          transition={{ duration:0.55, delay:0.45 }}>
          {[
            { value:"50", suffix:"k+", label:"Resumes analyzed" },
            { value:"3.2", suffix:"×",  label:"More interview calls" },
            { value:"98",  suffix:"%",  label:"Satisfaction rate" },
          ].map((s) => (
            <div className="stat" key={s.label}>
              <span className="stat-num">
                <AnimNum value={s.value} suffix={s.suffix} />
              </span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Score Widget */}
        <motion.div className="score-widget-demo"
          initial={{ opacity:0, y:40, scale:0.96 }}
          animate={{ opacity:1, y:0, scale:1 }}
          transition={{ duration:0.7, delay:0.6 }}>
          <div className="sw-header">
            <span className="sw-title">Resume Score</span>
            <span className="sw-score">78<span>/100</span></span>
          </div>
          {bars.map((b) => (
            <div className="sw-bar-row" key={b.label}>
              <div className="sw-bar-top">
                <span className="sw-bar-label">{b.label}</span>
                <span className="sw-bar-pct">{b.pct}%</span>
              </div>
              <div className="sw-bar-track">
                <motion.div className="sw-bar-fill" style={{ background:b.color }}
                  initial={{ width:0 }} animate={{ width:`${b.pct}%` }}
                  transition={{ duration:1.3, ease:"easeOut", delay:0.9 }}
                />
              </div>
            </div>
          ))}
          <div className="sw-tags">
            <div className="sw-tag-label">Missing skills</div>
            <div className="sw-tag-list">
              {["Docker","Kubernetes","CI/CD"].map((s) => <span key={s} className="tag-missing">{s}</span>)}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Pain Points ──────────────────────────────────────────────────────────────
function PainPoints() {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:"-80px" });
  const cards = [
    {
      cls:"seeker", icon:"🎯", heading:"For Job Seekers", dotColor:"#f43f5e",
      items:[
        "Resumes don't highlight key skills or experience effectively",
        "ATS rejects most applications before a human sees them",
        "Hard to know which skills are missing for a target role",
        "Interview preparation is difficult without personalized guidance",
        "Job applications go unnoticed by recruiters",
      ],
    },
    {
      cls:"recruiter", icon:"🏢", heading:"For Recruiters & HR Teams", dotColor:"#f59e0b",
      items:[
        "Screening hundreds of resumes manually is time-consuming",
        "Hard to quickly identify the top-fit candidates",
        "Shortlisting has bias and human error",
        "Lack of AI insights for improving job postings",
        "Top talent often gets missed in the volume",
      ],
    },
  ];
  return (
    <section ref={ref}>
      <div className="section-wrap">
        <div className="section-label">The Problem</div>
        <h2 className="section-title">Why Most Job Searches <em>Stall</em></h2>
        <p className="section-sub">Job seekers and recruiters both face massive friction in hiring. HireBot eliminates it with AI.</p>
        <div className="pain-grid">
          {cards.map((card, i) => (
            <motion.div key={card.cls} className={`pain-card ${card.cls}`}
              initial={{ opacity:0, y:32 }}
              animate={inView ? { opacity:1, y:0 } : {}}
              transition={{ duration:0.55, delay:i * 0.15 }}>
              <span className="pain-icon">{card.icon}</span>
              <div className="pain-heading">{card.heading}</div>
              <ul className="pain-list">
                {card.items.map((item) => (
                  <li key={item}>
                    <div className="pain-dot" style={{ background:card.dotColor }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { num:"01", color:"#4f46e5", bg:"rgba(79,70,229,0.15)",  icon:<Icon.Upload />, title:"Upload Your Resume",  desc:"Drop your PDF or Word file. Our AI parses every section instantly — no special formatting needed." },
    { num:"02", color:"#10b981", bg:"rgba(16,185,129,0.15)", icon:<Icon.Brain />,  title:"Get AI Analysis",    desc:"Receive a score, skill gap report, ATS check, and specific improvement suggestions in seconds." },
    { num:"03", color:"#f59e0b", bg:"rgba(245,158,11,0.15)", icon:<Icon.Rocket />, title:"Apply Smarter",      desc:"Target the right roles with a resume optimized for each job description and apply with confidence." },
  ];
  return (
    <section className="how-it-works">
      <div className="section-wrap">
        <div className="section-label">How It Works</div>
        <h2 className="section-title">Three Steps to Your <em>Next Job</em></h2>
        <p className="section-sub">From upload to offer — our AI handles the heavy lifting so you focus on landing interviews.</p>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <motion.div key={s.num} className="step-card"
              initial={{ opacity:0, y:40 }}
              whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              transition={{ duration:0.55, delay:i * 0.15 }}>
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

// ─── Feature Showcase ─────────────────────────────────────────────────────────
function FeatureShowcase() {
  const [active, setActive] = useState("score");
  const feat = FEATURES.find((f) => f.id === active);
  const MockComp = MOCK_MAP[active];

  return (
    <section className="feature-showcase">
      <div className="section-wrap">
        <div className="section-label">Platform Features</div>
        <h2 className="section-title">Everything You Need to <em>Win</em></h2>
        <p className="section-sub">Six powerful AI tools for job seekers and recruiters. Click any feature to explore.</p>

        <div className="fs-tabs">
          {FEATURES.map((f) => (
            <motion.button key={f.id}
              className={`fs-tab ${active === f.id ? "active" : ""}`}
              style={active === f.id ? { background:f.color, borderColor:f.color } : {}}
              onClick={() => setActive(f.id)}
              whileTap={{ scale:0.94 }}>
              {f.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={active} className="fs-display"
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:-20 }} transition={{ duration:0.3 }}>
            <div className="fs-visual" style={{ background:feat.bgAlpha, borderColor:feat.borderAlpha }}>
              <MockComp color={feat.color} />
            </div>
            <div className="fs-content">
              <div className="fs-badge" style={{ background:feat.badgeBg, color:feat.badgeColor }}>
                <span className="fs-badge-dot" style={{ background:feat.badgeColor }} />
                {feat.label}
              </div>
              <h3 className="fs-title">{feat.title}</h3>
              <p className="fs-desc">{feat.desc}</p>
              <ul className="fs-bullets">
                {feat.bullets.map((b) => (
                  <li key={b}>
                    <div className="fs-check" style={{ background:`${feat.color}22`, color:feat.badgeColor }}><Icon.Check /></div>
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

// ─── User Journey ─────────────────────────────────────────────────────────────
function Journey() {
  const steps = [
    { color:"#4f46e5", title:"Land on HireBot",       desc:"See the headline, stats, and demo widget. Instantly understand the value proposition." },
    { color:"#10b981", title:"Upload Your Resume",    desc:"Click Upload Resume, create a free account, and drop your file. AI parses it in seconds." },
    { color:"#f59e0b", title:"See Your Score & Gaps", desc:"View your resume score, ATS compatibility, and a list of missing skills vs. your target job." },
    { color:"#7c3aed", title:"Apply AI Fixes",        desc:"Get rewritten bullet points, keyword suggestions, and a fully optimized resume to download." },
    { color:"#f43f5e", title:"Prep for Interviews",   desc:"Use AI-generated interview questions tailored to your resume and target role." },
    { color:"#10b981", title:"Get More Interviews",   desc:"Apply smarter and track all applications. Users report 3× more interview callbacks." },
  ];
  return (
    <section>
      <div className="section-wrap">
        <div className="section-label">User Journey</div>
        <h2 className="section-title">From First Visit to <em>Hired</em></h2>
        <p className="section-sub">Here's what the experience looks like from the moment you land on HireBot.</p>
        <div className="journey-flow">
          {steps.map((s, i) => (
            <motion.div key={s.title} className="journey-step"
              initial={{ opacity:0, x:-24 }}
              whileInView={{ opacity:1, x:0 }}
              viewport={{ once:true }}
              transition={{ duration:0.45, delay:i * 0.08 }}>
              <div className="j-num" style={{ borderColor:s.color, color:s.color, background:`${s.color}14` }}>
                {i + 1}
              </div>
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

// ─── Testimonials ─────────────────────────────────────────────────────────────
function Testimonials() {
  const cards = [
    { stars:5, text:"I applied to 30 jobs with my old resume and got zero calls. After HireBot's suggestions, I landed 4 interviews in a week.", name:"Priya Mehta", role:"Frontend Engineer", initials:"PM", bg:"rgba(79,70,229,0.2)", c:"#a5b4fc" },
    { stars:5, text:"The ATS optimization alone is worth it. I didn't know my resume was being filtered out before a human ever saw it.",          name:"James O.",   role:"Data Analyst",       initials:"JO", bg:"rgba(124,58,237,0.2)",c:"#c4b5fd" },
    { stars:5, text:"As a recruiter, I went from spending 3 hours shortlisting to 20 minutes. The AI ranking is shockingly accurate.",             name:"Anita Shah", role:"HR Lead @ TechCorp",  initials:"AS", bg:"rgba(16,185,129,0.2)",c:"#6ee7b7" },
  ];
  return (
    <section className="testimonials">
      <div className="section-wrap">
        <div className="section-label">Testimonials</div>
        <h2 className="section-title">Real Results from <em>Real Users</em></h2>
        <p className="section-sub">Thousands of job seekers and recruiters trust HireBot to move faster.</p>
        <div className="testi-grid">
          {cards.map((c, i) => (
            <motion.div key={c.name} className="testi-card"
              initial={{ opacity:0, y:32 }}
              whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              transition={{ duration:0.5, delay:i * 0.12 }}>
              <div className="stars">{"★".repeat(c.stars)}</div>
              <div className="testi-text">"{c.text}"</div>
              <div className="testi-author">
                <div className="testi-avatar" style={{ background:c.bg, color:c.c }}>{c.initials}</div>
                <div>
                  <div className="testi-name">{c.name}</div>
                  <div className="testi-role">{c.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Recruiter Strip ──────────────────────────────────────────────────────────
function RecruiterStrip() {
  const navigate = useNavigate();
  return (
    <section className="recruiter-strip">
      <div className="section-wrap" style={{ paddingTop:0 }}>
        <motion.div className="rs-card"
          initial={{ opacity:0, y:24 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }}
          transition={{ duration:0.5 }}>
          <div>
            <div className="section-label" style={{ marginBottom:8 }}>For Recruiters</div>
            <h3 style={{ fontFamily:"var(--font-display)", fontSize:"1.5rem", fontWeight:900, color:"var(--c-text1)", marginBottom:10, letterSpacing:"-0.3px" }}>
              Stop Drowning in Resumes
            </h3>
            <p style={{ fontSize:14, color:"var(--c-text2)", lineHeight:1.8, maxWidth:500 }}>
              Post a job and let AI instantly rank every applicant with a match score, skill summary, and red flags — so you spend time only on candidates who actually fit.
            </p>
            <div className="rs-tags">
              {["AI Candidate Ranking","Match Score","Bias Reduction","JD Optimization"].map((t) => (
                <span key={t} className="rs-tag">{t}</span>
              ))}
            </div>
          </div>
          <button className="rs-btn" onClick={() => navigate("/recruiter")}>
            Post a Job <Icon.ArrowRight />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTABanner() {
  const navigate = useNavigate();
  return (
    <div className="cta-banner-section">
      <motion.div className="cta-inner"
        initial={{ opacity:0, scale:0.96 }}
        whileInView={{ opacity:1, scale:1 }}
        viewport={{ once:true }}
        transition={{ duration:0.55 }}>
        <h2>Ready to Land More <em>Interviews</em>?</h2>
        <p>Join 50,000+ job seekers and recruiters already using HireBot's AI to move faster and smarter.</p>
        <div className="cta-btns">
          <button className="btn-white" onClick={() => navigate("/resume-analyzer")}>
            Upload Your Resume — Free
          </button>
          <button className="btn-outline-white" onClick={() => navigate("/demo")}>
            View Demo
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="landing-footer">
      <div className="footer-logo">
        <div className="footer-logo-mark">H</div>
        <span className="logo-main">
          Hire<span className="logo-bold">Bot</span><span className="logo-ai">AI</span>
        </span>
      </div>

      <div className="footer-links">
        {["Privacy","Terms","Blog","Contact"].map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>

      <div style={{ fontSize:12, color:"var(--c-text3)" }}>
        © 2025 HireBot AI. All rights reserved.
      </div>
    </footer>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function HirebotLanding() {
  return (
    <div className="landing">
      <ScrollProgress />
      <Navbar />
      <Hero />
      <hr className="section-divider" />
      <PainPoints />
      <hr className="section-divider" />
      <HowItWorks />
      <hr className="section-divider" />
      <FeatureShowcase />
      <hr className="section-divider" />
      <Journey />
      <hr className="section-divider" />
      <Testimonials />
      <hr className="section-divider" />
      <RecruiterStrip />
      <hr className="section-divider" />
      <CTABanner />
      <Footer />
    </div>
  );
}