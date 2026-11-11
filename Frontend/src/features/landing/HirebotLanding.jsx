import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion, useInView, useScroll, useTransform, useSpring, useMotionValue, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { useAuth } from "../auth/hooks/useAuth";
import "./styles/landing.scss";

const Icon = {
  Arrow: () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7" /></svg>,
  Spark: () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" /><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" /></svg>,
  Check: () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>,
  Menu: () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>,
  Close: () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>,
  File: () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></svg>,
};

function BrandLogo() {
  return <span className="brand-lockup"><span className="brand-mark">H</span><span>HireBot<span className="brand-ai">AI</span></span></span>;
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      setProgress(max > 0 ? (root.scrollTop / max) * 100 : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return <div className="scroll-progress" style={{ width: `${progress}%` }} />;
}

function Navbar({ onOpenMenu }) {
  const navigate = useNavigate();
  const { user, isAdmin, handleLogout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const logout = async () => {
    await handleLogout();
    navigate("/");
  };

  return (
    <nav className={`landing-nav ${scrolled ? "is-scrolled" : ""}`}>
      <button className="nav-brand" onClick={() => navigate("/")} aria-label="HireBot home"><BrandLogo /></button>
      <div className="nav-links">
        <button onClick={() => document.getElementById("story")?.scrollIntoView({ behavior: "smooth" })}>The story</button>
        <button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>How it works</button>
        <button onClick={() => navigate("/jobs")}>Explore jobs</button>
        <button onClick={() => navigate("/recruiter")}>For recruiters</button>
        <button onClick={() => navigate("/pricing")}>Pricing</button>
        {isAdmin && <button onClick={() => navigate("/admin")}>Admin</button>}
      </div>
      <div className="nav-actions">
        {user ? (
          <>
            <button className="nav-text-action" onClick={() => navigate(isAdmin ? "/admin" : user.role === "recruiter" ? "/recruiter" : "/dashboard")}>Dashboard</button>
            <button className="nav-outline" onClick={logout}>Log out</button>
          </>
        ) : (
          <>
            <button className="nav-text-action" onClick={() => navigate("/login")}>Log in</button>
            <button className="nav-cta" onClick={() => navigate("/register")}>Get started <Icon.Arrow /></button>
          </>
        )}
      </div>
      <button className="nav-mobile-toggle" onClick={onOpenMenu} aria-label="Open navigation"><Icon.Menu /></button>
    </nav>
  );
}

function MobileMenu({ open, onClose }) {
  const navigate = useNavigate();
  const { user, isAdmin, handleLogout } = useAuth();
  const go = (path) => { navigate(path); onClose(); };
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="mobile-menu-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.aside className="mobile-menu-panel" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }} onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-top"><BrandLogo /><button onClick={onClose} aria-label="Close navigation"><Icon.Close /></button></div>
            <button onClick={() => go("/jobs")}>Explore jobs <Icon.Arrow /></button>
            <button onClick={() => go("/recruiter")}>For recruiters <Icon.Arrow /></button>
            <button onClick={() => go("/pricing")}>Pricing <Icon.Arrow /></button>
            {user ? (
              <>
                <button onClick={() => go(isAdmin ? "/admin" : user.role === "recruiter" ? "/recruiter" : "/dashboard")}>Dashboard <Icon.Arrow /></button>
                <button className="mobile-logout" onClick={async () => { await handleLogout(); go("/"); }}>Log out</button>
              </>
            ) : (
              <>
                <button onClick={() => go("/login")}>Log in <Icon.Arrow /></button>
                <button className="mobile-signup" onClick={() => go("/register")}>Get started <Icon.Arrow /></button>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ResumeVisual() {
  return (
    <div className="hero-visual" aria-label="Illustration of an AI resume analysis">
      <div className="visual-orbit orbit-one" />
      <div className="visual-orbit orbit-two" />
      <motion.div className="resume-sheet" initial={{ opacity: 0, y: 24, rotate: -5 }} animate={{ opacity: 1, y: 0, rotate: -3 }} transition={{ duration: 0.8, delay: 0.25 }}>
        <div className="resume-topline"><span className="resume-avatar">PK</span><span><b>Product-minded developer</b><small>Resume · PDF</small></span><span className="file-chip"><Icon.File /></span></div>
        <div className="resume-rule" />
        <span className="resume-section-label">EXPERIENCE</span>
        <div className="resume-line line-long" /><div className="resume-line line-mid" /><div className="resume-line line-short" />
        <span className="resume-section-label resume-skills-label">SKILLS</span>
        <div className="resume-tags"><i>React</i><i>Node.js</i><i>SQL</i><i>REST APIs</i></div>
        <motion.div className="scan-beam" animate={{ y: [0, 118, 0] }} transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }} />
        <div className="scan-corner corner-a" /><div className="scan-corner corner-b" />
      </motion.div>
      <motion.div className="match-card" initial={{ opacity: 0, x: 25, y: 12 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: 0.8, duration: 0.65 }}>
        <div className="match-card-head"><span className="match-pulse" /> ROLE MATCH <span className="match-dots">•••</span></div>
        <div className="match-score-row"><strong>84</strong><span>/100<br /><small>Illustrative score</small></span><div className="match-ring"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="17" /><circle className="match-ring-progress" cx="22" cy="22" r="17" /></svg></div></div>
        <div className="match-divider" />
        <div className="match-skill"><span>Core skills</span><b>Strong fit</b></div><div className="match-bar"><i style={{ width: "88%" }} /></div>
        <div className="match-skill"><span>Experience</span><b>Good fit</b></div><div className="match-bar"><i style={{ width: "72%" }} /></div>
        <div className="match-note"><span>✦</span> Review the gaps before applying</div>
      </motion.div>
      <motion.div className="floating-note note-scan" animate={{ y: [0, -7, 0] }} transition={{ duration: 3.2, repeat: Infinity }}><span className="note-icon"><Icon.Check /></span> Resume scanned</motion.div>
      <motion.div className="floating-note note-match" animate={{ y: [0, 7, 0] }} transition={{ duration: 3.8, repeat: Infinity }}><span className="note-spark"><Icon.Spark /></span> Skills connected</motion.div>
      <div className="visual-caption">A clearer next step starts here <span>↗</span></div>
    </div>
  );
}

function Hero() {
  const navigate = useNavigate();
  return (
    <section className="hero-section">
      <div className="hero-grain" />
      <div className="hero-inner">
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
          <div className="eyebrow"><span className="eyebrow-dot" /><Icon.Spark /> CAREER INTELLIGENCE, MADE PRACTICAL</div>
          <h1>Make your next move<br /><em>make more sense.</em></h1>
          <p className="hero-description">Understand your resume, connect your skills to the roles you want, and prepare with a plan — all in one place.</p>
          <div className="hero-actions">
            <button className="button-primary" onClick={() => navigate("/resume-analyzer")}>Analyze my resume <Icon.Arrow /></button>
            <button className="button-secondary" onClick={() => navigate("/jobs")}>Explore opportunities</button>
          </div>
          <div className="hero-footnote"><span className="footnote-check"><Icon.Check /></span> Start free · No credit card required</div>
        </motion.div>
        <ResumeVisual />
      </div>
      <div className="hero-bottomline"><span>01 / CAREER CLARITY</span><span>BUILT FOR CANDIDATES & RECRUITERS</span><span>SCROLL TO EXPLORE ↓</span></div>
    </section>
  );
}

const features = [
  { number: "01", label: "RESUME INTELLIGENCE", title: "Know what your resume is saying.", text: "Get structured feedback on content, readability, experience, and the skills your target roles ask for.", className: "feature-wide", visual: "score" },
  { number: "02", label: "JOB DESCRIPTION MATCH", title: "See where the fit is — and isn't.", text: "Compare your profile with a role, surface relevant strengths, and identify gaps worth working on.", className: "feature-tall", visual: "match" },
  { number: "03", label: "SKILL GAP INSIGHTS", title: "Turn missing skills into a plan.", text: "Spot skills mentioned in a job description that are not yet clear in your profile.", className: "", visual: "skills" },
  { number: "04", label: "AI RESUME IMPROVEMENT", title: "Make your experience easier to understand.", text: "Get suggestions to sharpen bullet points and communicate outcomes more clearly.", className: "", visual: "rewrite" },
  { number: "05", label: "INTERVIEW PREP", title: "Practise with context.", text: "Prepare technical and behavioural questions based on your resume and target role.", className: "", visual: "interview" },
  { number: "06", label: "RECRUITER WORKSPACE", title: "Review candidates with more context.", text: "Organise applicants and use AI-assisted summaries and matching as decision support — not a replacement for human judgement.", className: "feature-wide feature-recruiter", visual: "recruiter" },
];

function FeatureVisual({ type }) {
  if (type === "score") return <div className="feature-visual score-visual"><div className="score-visual-top"><span>RESUME REVIEW</span><span className="visual-status">COMPLETE</span></div><div className="score-visual-main"><div className="score-big">84<span>/100</span></div><div className="score-copy"><b>Clear foundation.</b><small>Here are a few ways to make your impact easier to scan.</small></div></div><div className="score-bars"><i style={{ width: "84%" }} /><i style={{ width: "68%" }} /><i style={{ width: "91%" }} /></div><div className="score-labels"><span>Structure</span><span>Impact</span><span>Skills</span></div></div>;
  if (type === "match") return <div className="feature-visual match-visual"><div className="match-visual-heading">ROLE FIT SNAPSHOT <span>↗</span></div><div className="role-pill">Frontend Developer</div><div className="match-visual-number">84<small>% illustrative</small></div><div className="match-visual-tags"><i>React</i><i>JavaScript</i><i className="tag-gap">Testing</i></div><div className="match-visual-footer">Strengths and gaps, side by side.</div></div>;
  if (type === "skills") return <div className="feature-visual skills-visual"><div className="skill-chip chip-blue">React <b>✓</b></div><div className="skill-chip chip-green">REST APIs <b>✓</b></div><div className="skill-chip chip-yellow">Testing <b>+</b></div><div className="skill-chip chip-pink">Cloud basics <b>+</b></div><span className="skills-connector" /></div>;
  if (type === "rewrite") return <div className="feature-visual rewrite-visual"><div className="rewrite-before"><small>BEFORE</small><span>Worked on the dashboard and fixed bugs.</span></div><div className="rewrite-arrow">↓</div><div className="rewrite-after"><small>REFINEMENT IDEA</small><span>Improved dashboard workflows and resolved recurring UI issues.</span></div></div>;
  if (type === "interview") return <div className="feature-visual interview-visual"><div className="interview-orb"><Icon.Spark /></div><div><small>QUESTION 01</small><b>Tell me about a project where you solved a difficult problem.</b><span>Behavioural · Project deep dive</span></div></div>;
  return <div className="feature-visual recruiter-visual"><div className="candidate-row candidate-heading"><span>CANDIDATE</span><span>ROLE ALIGNMENT</span><span>REVIEW</span></div>{[["A. Sharma","Strong"],["M. Verma","Relevant"],["S. Khan","Review"]].map((item) => <div className="candidate-row" key={item[0]}><span className="candidate-name"><i>{item[0].slice(0,1)}</i>{item[0]}</span><b>{item[1]}</b><span className="candidate-review">Open profile ↗</span></div>)}</div>;
}

function FeaturesSection() {
  return (
    <section className="features-section" id="platform">
      <div className="section-wrap">
        <div className="section-intro"><div><span className="section-kicker">THE HIREBOT TOOLKIT / 01—06</span><h2>Less guesswork.<br /><em>More direction.</em></h2></div><p>Practical tools for the moments that shape a job search — from the first resume review to the final interview.</p></div>
        <div className="features-grid">
          {features.map((feature) => <motion.article className={`feature-card ${feature.className}`} key={feature.number} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.5 }}>
            <div className="feature-meta"><span>{feature.number}</span><span>{feature.label}</span></div>
            <h3>{feature.title}</h3><p>{feature.text}</p><FeatureVisual type={feature.visual} />
          </motion.article>)}
        </div>
      </div>
    </section>
  );
}

/* ───────────── STORY (scroll-driven narrative) ───────────── */

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function useScrub(p, fn) {
  const [v, setV] = useState(() => fn(p.get()));
  useMotionValueEvent(p, "change", (x) => setV(fn(x)));
  return v;
}

function Words({ text }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span className="st-word" key={i}>
          <motion.span initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: i * 0.06, duration: 0.65, ease: [0.2, 0.7, 0.2, 1] }}>{w}&nbsp;</motion.span>
        </span>
      ))}
    </>
  );
}

function SceneSilence({ p }) {
  const v = useScrub(p, (x) => x);
  const replies = [5, 13, 20];
  const rc = replies.filter((i) => i / 30 < v).length;
  const n = Math.round(v * 200);
  return (
    <div className="st-card">
      <div className="st-card-top"><span>JOB SEARCH · WEEK 6</span><em>FICTIONAL STORY</em></div>
      <div className="st-big"><strong>{n}</strong><span>applications sent</span></div>
      <div className="st-tiles">
        {Array.from({ length: 30 }, (_, i) => {
          const sent = i / 30 < v;
          return <i key={i} className={sent ? (replies.includes(i) ? "is-reply" : "is-sent") : ""} />;
        })}
      </div>
      <div className="st-stat"><b className="ok">{rc}</b> replies <span>·</span> <b>{Math.max(0, n - rc)}</b> silence</div>
      <p className="st-quote">“I know I'm qualified. I just don't know what's wrong.”<small>— Priya, frontend developer</small></p>
    </div>
  );
}

function SceneUpload({ p }) {
  const v = useScrub(p, (x) => x);
  const lines = [88, 70, 80, 56, 84, 64, 48, 76];
  return (
    <div className="st-card st-two">
      <div className="st-sheet">
        <div className="st-sheet-head"><span>PK</span><b>resume_priya.pdf</b></div>
        {lines.map((w, i) => <i key={i} style={{ width: `${w}%`, background: v > (i + 0.5) / lines.length ? "#b9c7ff" : "#e8e9eb" }} />)}
        <b className="st-beam" style={{ top: `${8 + v * 88}%` }} />
      </div>
      <div className="st-side">
        <small>SKILLS FOUND</small>
        <div className="st-tags">{["React", "Node.js", "SQL", "REST APIs"].map((t, i) => <span key={t} className={v > 0.25 + i * 0.15 ? "on" : ""}>{t}</span>)}</div>
        <small>TARGET ROLE</small>
        <p>Frontend Developer · React, TypeScript, testing, CI/CD…</p>
        <div className="st-status">{v < 0.98 ? "Reading in memory…" : "Ready to analyse ✓"}</div>
        <div className="st-privacy">🔒 Never written to disk</div>
      </div>
    </div>
  );
}

function SceneInsight({ p }) {
  const v = useScrub(p, (x) => 1 - Math.pow(1 - x, 3));
  const c = 2 * Math.PI * 42;
  const bars = [["ATS", 78], ["Skills", 88], ["Keywords", 64]];
  return (
    <div className="st-card st-two">
      <div className="st-ring">
        <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" /><circle cx="50" cy="50" r="42" strokeDasharray={c} strokeDashoffset={c * (1 - 0.84 * v)} /></svg>
        <div><strong>{Math.round(84 * v)}</strong><small>OVERALL / 100</small></div>
      </div>
      <div className="st-side">
        {bars.map(([l, n]) => (
          <div className="st-bar" key={l}><span>{l}<b>{Math.round(n * v)}</b></span><i><u style={{ width: `${n * v}%` }} /></i></div>
        ))}
        <small>MISSING KEYWORDS</small>
        <div className="st-tags gap">{["TypeScript", "Jest", "CI/CD"].map((t, i) => <span key={t} className={v > 0.6 + i * 0.12 ? "on" : ""}>{t}</span>)}</div>
        <div className="st-status">{v > 0.9 ? "A straight answer — and a plan." : "Comparing against the role…"}</div>
      </div>
    </div>
  );
}

const AFTER = "Rebuilt dashboard workflows and resolved recurring UI defects, cutting repeat support tickets.";
function SceneRewrite({ p }) {
  const v = useScrub(p, (x) => x);
  const n = Math.floor(clamp((v - 0.15) / 0.7) * AFTER.length);
  return (
    <div className="st-card">
      <div className="st-card-top"><span>BULLET REWRITE</span><em>AI SUGGESTION</em></div>
      <div className="st-before"><small>BEFORE</small><s style={{ opacity: v > 0.12 ? 0.55 : 1 }}>Worked on dashboard and fixed bugs.</s></div>
      <div className="st-arrow" style={{ opacity: v > 0.1 ? 1 : 0.2 }}>↓</div>
      <div className="st-after"><small>AFTER</small><p>{AFTER.slice(0, n)}<span className="hw-caret" /></p></div>
      <div className="st-chips-row">
        {["Action verb", "Outcome", "Specific"].map((t, i) => <span key={t} className={v > 0.8 + i * 0.06 ? "on" : ""}>✓ {t}</span>)}
      </div>
      <p className="st-note">Same experience. Easier to understand at a glance.</p>
    </div>
  );
}

function SceneInterview({ p }) {
  const v = useScrub(p, (x) => x);
  const star = ["S", "T", "A", "R"];
  return (
    <div className="st-card st-two">
      <div className="st-chat">
        <div className="st-bubble q" style={{ opacity: v > 0.05 ? 1 : 0, transform: `translateY(${v > 0.05 ? 0 : 12}px)` }}><small>QUESTION 01 · BEHAVIOURAL</small>Tell me about a project where you solved a difficult problem.</div>
        <div className="st-bubble a" style={{ opacity: v > 0.2 ? 1 : 0 }}>
          <small>MODEL ANSWER</small>
          {[100, 86, 64].map((w, i) => <i key={i} style={{ width: `${w * clamp(v * 2.6 - 0.5 - i * 0.4)}%` }} />)}
          <div className="st-star">{star.map((s, i) => <b key={s} className={v > 0.45 + i * 0.1 ? "on" : ""}>{s}</b>)}</div>
        </div>
      </div>
      <div className="st-side">
        <small>YOUR PLAN</small>
        {[["Week 1", "Core React & JS"], ["Week 2", "System design"], ["Week 3", "STAR stories + mocks"]].map(([w, t], i) => (
          <div className={`st-week ${v > 0.55 + i * 0.15 ? "on" : ""}`} key={w}><i>{v > 0.55 + i * 0.15 ? "✓" : ""}</i><span><b>{w}</b>{t}</span></div>
        ))}
      </div>
    </div>
  );
}

function SceneResult({ p }) {
  const v = useScrub(p, (x) => x);
  const up = v > 0.35;
  const rows = [
    { n: "Arjun Rao", s: 88 }, { n: "Sana Khan", s: 84 }, { n: "Meera Iyer", s: 71 }, { n: "Priya K.", s: up ? 91 : 62, me: true },
  ].sort((a, b) => b.s - a.s);
  return (
    <div className="st-card">
      <div className="st-card-top"><span>RECRUITER · LEADERBOARD</span><em>FICTIONAL STORY</em></div>
      <div className="hw-board">
        {rows.map((c, i) => (
          <motion.div layout transition={{ type: "spring", stiffness: 240, damping: 26 }} key={c.n} className={`hw-cand ${i === 0 ? "is-top" : ""} ${c.me ? "is-me" : ""}`}>
            <span className="hw-rank">{i + 1}</span><span className="hw-av">{c.n[0]}</span><b>{c.n}{c.me && <u>YOU</u>}</b>
            <span className="hw-score-bar"><i style={{ width: `${c.s}%`, transition: "width .8s" }} /></span><em>{c.s}</em>
          </motion.div>
        ))}
      </div>
      <div className="st-toast" style={{ opacity: v > 0.7 ? 1 : 0, transform: `translateY(${v > 0.7 ? 0 : 14}px)` }}>✉ <b>Interview invitation received</b><small>Frontend Developer · Northwind</small></div>
      <p className="st-note">Rankings are decision support — people make the final call.</p>
    </div>
  );
}

const chapters = [
  { k: "Silence", title: "Two hundred applications.", em: "Three replies.", text: "Priya is a capable developer. But without feedback, every rejection — and every non-reply — feels like a mystery.", glow: "#5a2a3a", Scene: SceneSilence },
  { k: "Upload", title: "One PDF.", em: "One target role.", text: "She drops in her resume and the job description she actually wants. Everything is read in memory — never stored on disk.", glow: "#1f3a8a", Scene: SceneUpload },
  { k: "Insight", title: "Finally, a", em: "straight answer.", text: "Scores for ATS, skills and keywords — plus exactly which keywords are missing, and why it matters for this role.", glow: "#2f4fe0", Scene: SceneInsight },
  { k: "Rewrite", title: "Same experience.", em: "Clearer story.", text: "AI rewrites weak bullets into clear, specific ones. Priya stays in control and keeps what sounds like her.", glow: "#4a6a14", Scene: SceneRewrite },
  { k: "Prepare", title: "Walk in already", em: "rehearsed.", text: "Role-specific technical and behavioural questions, model answers, and a week-by-week plan built around her gaps.", glow: "#5b3a9a", Scene: SceneInterview },
  { k: "The call", title: "Seen first.", em: "Invited next.", text: "On the other side, recruiters see applicants ranked by match — and Priya's stronger resume rises to the top.", glow: "#6b8a10", Scene: SceneResult },
];

function Stage({ i, progress }) {
  const p = useTransform(progress, (v) => clamp((v * chapters.length - i) / 0.8));
  const S = chapters[i].Scene;
  return <S p={p} />;
}

function StorySection() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const still = useMotionValue(1);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const [ch, setCh] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setCh(Math.min(chapters.length - 1, Math.floor(v * chapters.length))));

  const goTo = (i) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY + (el.offsetHeight - window.innerHeight) * ((i + 0.5) / chapters.length);
    window.scrollTo({ top, behavior: "smooth" });
  };

  if (reduce) {
    return (
      <section className="st-section st-static" id="story">
        {chapters.map((c, i) => (
          <div className="st-static-item" key={c.k}>
            <div className="st-copy"><span className="section-kicker">CHAPTER 0{i + 1} / 06 · {c.k.toUpperCase()}</span><h2>{c.title} <em>{c.em}</em></h2><p>{c.text}</p></div>
            <div className="st-scene"><c.Scene p={still} /></div>
          </div>
        ))}
      </section>
    );
  }

  const c = chapters[ch];
  return (
    <section className="st-section" id="story" ref={ref}>
      <div className="st-sticky">
        <motion.div className="st-glow" animate={{ backgroundColor: c.glow }} transition={{ duration: 1.2 }} />
        <div className="st-dots" />
        <div className="st-copy">
          <AnimatePresence mode="wait">
            <motion.div key={ch} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
              <span className="section-kicker">CHAPTER 0{ch + 1} / 06 · {c.k.toUpperCase()}</span>
              <h2><Words text={c.title} /><em><Words text={c.em} /></em></h2>
              <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}>{c.text}</motion.p>
              {ch === chapters.length - 1 && (
                <motion.button className="button-primary st-cta" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} onClick={() => navigate("/resume-analyzer")}>Start your own story <Icon.Arrow /></motion.button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="st-stage">
          <AnimatePresence mode="wait">
            <motion.div key={ch} className="st-scene" initial={{ opacity: 0, y: 36, scale: 0.95, rotateX: 8 }} animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }} exit={{ opacity: 0, y: -24, scale: 0.97 }} transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}>
              <Stage i={ch} progress={scrollYProgress} />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="st-rail">
          <motion.span className="st-rail-fill" style={{ scaleX: fill }} />
          {chapters.map((x, i) => (
            <button key={x.k} className={i === ch ? "is-on" : i < ch ? "is-done" : ""} onClick={() => goTo(i)} aria-label={`Go to chapter ${i + 1}: ${x.k}`}><i /><span>{x.k}</span></button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── HOW IT WORKS (animated feature showcase) ───────────── */

function useStepper(count, ms, active) {
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!active || !auto) return;
    const t = setInterval(() => setStep((s) => (s + 1) % count), ms);
    return () => clearInterval(t);
  }, [count, ms, active, auto]);
  const jump = (s) => { setStep(s); setAuto(false); };
  return { step, jump, auto, setAuto, reset: () => setStep(0) };
}

function CountUp({ to, run = true, duration = 1200 }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) { setV(0); return; }
    let raf, start;
    const tick = (t) => {
      start = start ?? t;
      const p = Math.min((t - start) / duration, 1);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, run, duration]);
  return <>{v}</>;
}

function Typed({ text, speed = 24, delay = 0 }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    let i = 0, iv;
    const start = setTimeout(() => {
      iv = setInterval(() => { i += 1; setN(i); if (i >= text.length) clearInterval(iv); }, speed);
    }, delay);
    return () => { clearTimeout(start); clearInterval(iv); };
  }, [text, speed, delay]);
  return <>{text.slice(0, n)}<span className="hw-caret" /></>;
}

function Ring({ value, label }) {
  const c = 2 * Math.PI * 18;
  return (
    <div className="hw-ring">
      <svg viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="18" />
        <motion.circle cx="22" cy="22" r="18" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - value / 100) }} transition={{ duration: 1.2, ease: "easeOut" }} />
      </svg>
      <b><CountUp to={value} /></b>
      <small>{label}</small>
    </div>
  );
}

const pop = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } };

function Frame({ title, children, badge }) {
  return (
    <div className="hw-frame">
      <div className="hw-frame-bar"><i /><i /><i /><span>{title}</span>{badge && <em>{badge}</em>}</div>
      <div className="hw-frame-body">{children}</div>
    </div>
  );
}

/* ---- Demo 1: Resume Analyzer ---- */
const fieldNames = ["Overall score", "ATS score", "Skills match", "Experience match", "Keywords match", "Score breakdown", "Hiring diagnosis", "Skill gaps", "Action plan", "Bullet rewrites", "Hiring outlook", "Missing keywords"];

function AnalyzerDemo({ step }) {
  return (
    <Frame title="Resume Analyzer" badge="ILLUSTRATIVE">
      <AnimatePresence mode="wait">
        <motion.div key={step} className="hw-pane" {...pop} transition={{ duration: 0.35 }}>
          {step === 0 && (
            <div className="hw-two">
              <div className="hw-drop">
                <motion.div className="hw-file" initial={{ y: -50, opacity: 0, rotate: -8 }} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={{ type: "spring", delay: 0.2 }}>
                  <Icon.File /><span><b>resume_priya.pdf</b><small>1.2 MB · PDF</small></span><Icon.Check />
                </motion.div>
                <small>Drop your PDF here</small>
              </div>
              <div className="hw-textarea"><small>JOB DESCRIPTION</small><p><Typed text="Frontend Developer — React, TypeScript, REST APIs, testing, CI/CD. 2+ years building production web apps…" speed={20} delay={400} /></p></div>
            </div>
          )}
          {step === 1 && (
            <div className="hw-two">
              <div className="hw-doc">
                {[90, 74, 82, 60, 88, 52].map((w, i) => <motion.div key={i} className="hw-doc-line" style={{ width: `${w}%` }} initial={{ background: "#e8e9eb" }} animate={{ background: ["#e8e9eb", "#b9c7ff", "#e8e9eb"] }} transition={{ delay: i * 0.35, duration: 0.9 }} />)}
                <motion.div className="hw-beam" initial={{ top: 0 }} animate={{ top: "100%" }} transition={{ duration: 2.4, ease: "linear" }} />
              </div>
              <div className="hw-log">
                {["Reading PDF in memory…", "Text extracted · 1,840 characters", "Not a scanned image ✓", "File never written to disk ✓"].map((l, i) => <motion.p key={l} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.55 }}>{l}</motion.p>)}
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <div className="hw-counter"><strong><CountUp to={23} duration={2200} /></strong><span>/ 23 fields analysed<small>Resume + job description → structured JSON</small></span></div>
              <div className="hw-chips">{fieldNames.map((f, i) => <motion.i key={f} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.17 }}>{f}</motion.i>)}<motion.i className="hw-chip-more" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.1 }}>+ 11 more</motion.i></div>
            </div>
          )}
          {step === 3 && (
            <div>
              <div className="hw-rings"><Ring value={84} label="Overall" /><Ring value={78} label="ATS" /><Ring value={88} label="Skills" /><Ring value={72} label="Keywords" /></div>
              <div className="hw-two hw-tight">
                <div className="hw-card"><small>MISSING KEYWORDS</small><div className="hw-chips">{["TypeScript", "Jest", "CI/CD"].map((k, i) => <motion.i key={k} className="hw-gap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 + i * 0.2 }}>{k}</motion.i>)}</div></div>
                <div className="hw-card"><small>BULLET REWRITE</small><s>Worked on dashboard and fixed bugs.</s><motion.b initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>Rebuilt dashboard workflows, resolving recurring UI defects.</motion.b></div>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="hw-center">
              <motion.div className="hw-pdf" initial={{ scale: 0.8, rotate: -6 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring" }}><Icon.File /><b>Optimised resume</b><small>ATS-friendly · PDF</small></motion.div>
              <motion.button className="hw-download" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} tabIndex={-1}>Download PDF ↓</motion.button>
              <small className="hw-sub">Saved to your account so you can revisit it anytime.</small>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </Frame>
  );
}

/* ---- Demo 2: Interview Prep ---- */
const techQs = ["How would you optimise a slow React list?", "Explain the event loop and microtasks.", "Design a REST API for job applications."];
const behQs = ["Tell me about a time you resolved a team conflict.", "Describe a deadline you almost missed."];

function InterviewDemo({ step }) {
  return (
    <Frame title="Interview Prep" badge="ILLUSTRATIVE">
      <AnimatePresence mode="wait">
        <motion.div key={step} className="hw-pane" {...pop} transition={{ duration: 0.35 }}>
          {step === 0 && (
            <div className="hw-two">
              <div className="hw-textarea"><small>TARGET ROLE</small><p><Typed text="Senior Frontend Engineer · React · TypeScript" speed={26} /></p></div>
              <div className="hw-card"><small>OPTIONAL</small><div className="hw-file hw-file-sm"><Icon.File /><span><b>resume_priya.pdf</b><small>Personalise to my background</small></span></div></div>
            </div>
          )}
          {step === 1 && (
            <div>
              <div className="hw-call"><span className="hw-dot" /> Call 1 · Questions & plan <em>smaller prompt = complete output</em></div>
              <div className="hw-qs">{[...techQs.map((q) => ["TECH", q]), ...behQs.map((q) => ["STAR", q])].map(([tag, q], i) => <motion.div key={q} className="hw-q" initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.3 }}><i className={tag === "STAR" ? "is-star" : ""}>{tag}</i>{q}</motion.div>)}</div>
              <motion.small className="hw-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }}>5 technical + 5 behavioural · showing 5</motion.small>
            </div>
          )}
          {step === 2 && (
            <div>
              <div className="hw-call"><span className="hw-dot hw-dot-lime" /> Call 2 · Model answers <em>matched by position</em></div>
              <div className="hw-pairs">{techQs.map((q, i) => <motion.div key={q} className="hw-pair" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.5 }}><span className="hw-q-mini">Q{i + 1}</span><motion.span className="hw-link" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: i * 0.5 + 0.25 }} /><span className="hw-a-mini"><b>A{i + 1}</b><span className="hw-ans-line" /><span className="hw-ans-line short" /></span></motion.div>)}</div>
            </div>
          )}
          {step === 3 && (
            <div className="hw-weeks">{[["Week 1", "Core React & JS depth"], ["Week 2", "System design practice"], ["Week 3", "STAR stories + mock rounds"]].map(([w, t], i) => <motion.div key={w} className="hw-week" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.3 }}><small>{w}</small><b>{t}</b><span className="hw-progress"><motion.i initial={{ width: 0 }} animate={{ width: `${40 + i * 25}%` }} transition={{ delay: 0.6 + i * 0.3, duration: 0.8 }} /></span></motion.div>)}</div>
          )}
        </motion.div>
      </AnimatePresence>
    </Frame>
  );
}

/* ---- Demo 3: Job Search ---- */
const jobList = [
  { t: "Frontend Developer", c: "Northwind · Bengaluru", s: "₹14–20L", m: 91 },
  { t: "React Engineer", c: "Lumen Labs · Remote", s: "₹12–18L", m: 86 },
  { t: "UI Developer", c: "Orbit · Delhi NCR", s: "₹9–14L", m: 74 },
];

function JobsDemo({ step }) {
  return (
    <Frame title="Job Board" badge="ILLUSTRATIVE">
      <AnimatePresence mode="wait">
        <motion.div key={step} className="hw-pane" {...pop} transition={{ duration: 0.35 }}>
          {step === 0 && (<div><div className="hw-search"><Icon.Arrow /><Typed text="react developer" speed={70} /></div><div className="hw-joblist">{jobList.map((j, i) => <motion.div key={j.t} className="hw-job" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 + i * 0.25 }}><b>{j.t}</b><small>{j.c}</small></motion.div>)}</div></div>)}
          {step === 1 && (<div><div className="hw-chips hw-filters">{["Bengaluru", "Full-time", "₹10L+", "React", "TypeScript"].map((f, i) => <motion.i key={f} className="hw-filter" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.25 }}>{f} ✕</motion.i>)}</div><div className="hw-joblist">{jobList.slice(0, 2).map((j, i) => <motion.div layout key={j.t} className="hw-job" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 + i * 0.2 }}><b>{j.t}</b><small>{j.c} · {j.s}</small></motion.div>)}</div><small className="hw-sub">Page 1 of 4 · results narrow instantly</small></div>)}
          {step === 2 && (<div><small className="hw-label">RECOMMENDED FROM YOUR RESUME</small><div className="hw-joblist">{jobList.map((j, i) => <motion.div key={j.t} className="hw-job hw-job-rec" initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.3 }}><span><b>{j.t}</b><small>{j.c}</small></span><em><CountUp to={j.m} />%</em></motion.div>)}</div></div>)}
          {step === 3 && (
            <div className="hw-two">
              <div className="hw-card"><small>RAW JD</small><p className="hw-raw">need react dev, good with apis, must work fast, 2 yrs exp</p></div>
              <motion.div className="hw-card hw-card-lime" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}><small>✦ ENHANCED · ATS-OPTIMISED</small><b>About the role</b><span className="hw-ans-line" /><span className="hw-ans-line short" /><b>Requirements</b><span className="hw-ans-line" /><span className="hw-ans-line short" /></motion.div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </Frame>
  );
}

/* ---- Demo 4: Candidate Ranking ---- */
const candidates = [
  { n: "Meera Iyer", s: 71 }, { n: "Arjun Rao", s: 93 }, { n: "Sana Khan", s: 84 }, { n: "Dev Patel", s: 62 },
];

function RankingDemo({ step }) {
  const rows = step >= 2 ? [...candidates].sort((a, b) => b.s - a.s) : candidates;
  const statusRows = [["shortlisted", "You have been shortlisted"], ["interview", "Interview invitation received"], ["rejected", "Application update received"]];
  return (
    <Frame title="Recruiter · Candidate Leaderboard" badge="ILLUSTRATIVE">
      <div className="hw-pane">
        {step === 0 && <motion.div className="hw-toast" initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}><span className="hw-dot hw-dot-lime" /> New application · Dev Patel · Frontend Developer</motion.div>}
        {step === 1 && <motion.div className="hw-toast" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><span className="hw-spin" /> AI is scoring every new resume against the role…</motion.div>}
        {step === 2 && <motion.div className="hw-toast" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Sorted by match score · best candidate first</motion.div>}
        {step < 3 && (
          <div className="hw-board">
            {rows.map((c, i) => (
              <motion.div layout transition={{ type: "spring", stiffness: 260, damping: 26 }} key={c.n} className={`hw-cand ${step >= 2 && i === 0 ? "is-top" : ""}`}>
                <span className="hw-rank">{step >= 2 ? i + 1 : "–"}</span>
                <span className="hw-av">{c.n[0]}</span><b>{c.n}</b>
                <span className="hw-score-bar"><motion.i initial={{ width: 0 }} animate={{ width: step >= 1 ? `${c.s}%` : 0 }} transition={{ duration: 0.9, delay: step === 1 ? 0.2 + candidates.indexOf(c) * 0.2 : 0 }} /></span>
                <em>{step >= 1 ? c.s : "—"}</em>
              </motion.div>
            ))}
          </div>
        )}
        {step === 3 && (
          <div className="hw-status">{statusRows.map(([s, mail], i) => <motion.div key={s} className="hw-status-row" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.45 }}><i className={`st-${s}`}>{s}</i><span className="hw-arrow">→</span><span>✉ {mail}</span></motion.div>)}</div>
        )}
      </div>
    </Frame>
  );
}

const showcase = [
  { id: "resume", tab: "Resume Analyzer", kicker: "FLAGSHIP FEATURE", title: "From a PDF to a 23-point analysis.", Demo: AnalyzerDemo, cta: ["Analyze my resume", "/resume-analyzer"],
    steps: [
      { t: "Upload", d: "Drop in your PDF resume and paste the job description you're targeting.", tag: "PDF · up to 3 MB" },
      { t: "Read", d: "Your resume is read in memory and never stored on disk. Scanned images are flagged straight away.", tag: "Private by design" },
      { t: "Analyze", d: "AI compares resume and role across 23 structured fields — scores, gaps, keywords and more.", tag: "23 fields" },
      { t: "Report", d: "See your overall, ATS, skills and keyword scores, plus missing keywords and bullet rewrites.", tag: "Actionable" },
      { t: "Export", d: "Generate an optimised resume as a PDF. Your analysis stays saved to your account.", tag: "PDF export" },
    ] },
  { id: "interview", tab: "Interview Prep", kicker: "TWO-STEP AI PIPELINE", title: "A full interview kit, every time.", Demo: InterviewDemo, cta: ["Prepare for an interview", "/interview"],
    steps: [
      { t: "Role", d: "Paste a job description, and optionally add your resume to personalise the kit.", tag: "JD + resume" },
      { t: "Questions", d: "Step one generates 5 technical and 5 behavioural (STAR) questions, a skill-gap list and a prep plan.", tag: "Call 1" },
      { t: "Answers", d: "Step two writes a model answer for each question, matched by position so nothing goes missing.", tag: "Call 2" },
      { t: "Plan", d: "Follow a week-by-week preparation plan built around your gaps.", tag: "Week by week" },
    ] },
  { id: "jobs", tab: "Job Search", kicker: "JOB MANAGEMENT", title: "Find roles. Post better ones.", Demo: JobsDemo, cta: ["Explore jobs", "/jobs"],
    steps: [
      { t: "Search", d: "Full-text search across job title, description and company.", tag: "Instant" },
      { t: "Filter", d: "Narrow by location, job type, salary range and skills. Paginated for large result sets.", tag: "Precise" },
      { t: "Recommend", d: "Logged-in job seekers get AI recommendations based on their resume profile.", tag: "Personalised" },
      { t: "Enhance", d: "Recruiters can turn a rough JD into a structured, ATS-optimised listing — and deactivate it any time without deleting.", tag: "For recruiters" },
    ] },
  { id: "ranking", tab: "Candidate Ranking", kicker: "RECRUITER WORKSPACE", title: "A ranked leaderboard, not an inbox.", Demo: RankingDemo, cta: ["See recruiter tools", "/recruiter"],
    steps: [
      { t: "Apply", d: "A candidate applies to your job.", tag: "Trigger" },
      { t: "Score", d: "Their resume is automatically scored against the role by AI the moment they apply.", tag: "Automatic" },
      { t: "Rank", d: "Applicants appear sorted by match score, best first. Use it as decision support, not a replacement for your judgement.", tag: "Leaderboard" },
      { t: "Notify", d: "Change a status and the candidate is emailed and notified automatically: shortlisted, interview or rejected.", tag: "Auto emails" },
    ] },
];

function FlowDiagram({ steps, active, onJump }) {
  return (
    <div className="hw-flow" role="tablist">
      {steps.map((s, i) => (
        <React.Fragment key={s.t}>
          <button role="tab" aria-selected={i === active} className={`hw-node ${i === active ? "is-active" : ""} ${i < active ? "is-done" : ""}`} onClick={() => onJump(i)}>
            <span className="hw-node-num">{i < active ? <Icon.Check /> : i + 1}</span>
            <b>{s.t}</b><small>{s.tag}</small>
          </button>
          {i < steps.length - 1 && <span className="hw-connector"><motion.i initial={false} animate={{ scaleX: i < active ? 1 : 0 }} transition={{ duration: 0.5 }} /></span>}
        </React.Fragment>
      ))}
    </div>
  );
}

function HowItWorks() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.35 });
  const f = showcase[tab];
  const { step, jump, auto, setAuto, reset } = useStepper(f.steps.length, 4200, inView);
  useEffect(() => { reset(); setAuto(true); }, [tab]); // eslint-disable-line
  const Demo = f.Demo;
  return (
    <section className="hw-section" id="how-it-works" ref={ref}>
      <div className="section-wrap">
        <div className="section-intro">
          <div><span className="section-kicker">HOW IT WORKS / SEE IT IN ACTION</span><h2>Watch the<br /><em>whole journey.</em></h2></div>
          <p>Every feature follows a simple flow. Pick one and see exactly what happens at each step.</p>
        </div>
        <div className="hw-tabs" role="tablist">
          {showcase.map((s, i) => <button key={s.id} role="tab" aria-selected={i === tab} className={i === tab ? "is-active" : ""} onClick={() => setTab(i)}>{s.tab}{i === tab && <motion.span layoutId="hw-tab-pill" className="hw-tab-pill" />}</button>)}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={f.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <FlowDiagram steps={f.steps} active={step} onJump={jump} />
            <div className="hw-stage">
              <div className="hw-copy">
                <span className="section-kicker">{f.kicker}</span>
                <h3>{f.title}</h3>
                <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="hw-step-copy">
                    <small>STEP {step + 1} OF {f.steps.length}</small>
                    <b>{f.steps[step].t}</b>
                    <p>{f.steps[step].d}</p>
                  </motion.div>
                </AnimatePresence>
                <div className="hw-controls">
                  <button className="button-primary" onClick={() => navigate(f.cta[1])}>{f.cta[0]} <Icon.Arrow /></button>
                  <button className="hw-auto" onClick={() => setAuto(!auto)}>{auto ? "❚❚ Pause" : "▶ Autoplay"}</button>
                </div>
              </div>
              <Demo step={step} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

const plans = [
  { name: "Free Tier", price: "₹0", period: "forever", description: "Essential tools to get your search moving.", features: ["Limited resume analyses", "Limited interview reports", "Job board access", "Application tracking"], cta: "Get started free", route: "/register" },
  { name: "Pro Access", price: "₹499", period: "/ month", description: "More room to prepare, improve, and iterate.", features: ["Expanded resume analysis access", "AI interview preparation", "Priority AI processing", "Advanced matching insights", "PDF exports and bullet suggestions"], cta: "Explore Pro", route: "/pricing", popular: true },
  { name: "Annual Pass", price: "₹3,999", period: "/ year", description: "Year-round access at a lower monthly equivalent.", features: ["Pro features for 12 months", "Annual billing", "Priority AI processing", "PDF exports and bullet suggestions"], cta: "View annual plan", route: "/pricing", badge: "ANNUAL" },
];

function PricingSection() {
  const navigate = useNavigate();
  return <section className="pricing-section" id="pricing"><div className="section-wrap">
    <div className="section-intro pricing-intro"><div><span className="section-kicker">SIMPLE PLANS / NO SURPRISES</span><h2>Invest in your<br /><em>next chapter.</em></h2></div><p>Start with the essentials. Upgrade when you need more room to prepare and improve.</p></div>
    <div className="pricing-grid">{plans.map((plan) => <article className={`pricing-card ${plan.popular ? "pricing-popular" : ""}`} key={plan.name}>
      <div className="pricing-card-top"><span>{plan.badge || (plan.popular ? "MOST POPULAR" : "GET STARTED")}</span>{plan.popular && <i>✦</i>}</div>
      <h3>{plan.name}</h3><p>{plan.description}</p>
      <div className="pricing-price"><strong>{plan.price}</strong><span>{plan.period}</span></div>
      <ul>{plan.features.map((feature) => <li key={feature}><Icon.Check />{feature}</li>)}</ul>
      <button className={plan.popular ? "button-primary" : "button-secondary"} onClick={() => navigate(plan.route)}>{plan.cta}<Icon.Arrow /></button>
    </article>)}</div>
    <p className="pricing-note">Plan features and usage limits are subject to the current in-app plan details.</p>
  </div></section>;
}

function CallToAction() {
  const navigate = useNavigate();
  return <section className="closing-section"><div className="closing-card"><div className="closing-stamp"><Icon.Spark /></div><span className="section-kicker">YOUR NEXT STEP STARTS HERE</span><h2>Bring a little more<br /><em>intention to the search.</em></h2><p>Get a clearer view of your strengths, your gaps, and what to do next.</p><button className="button-dark" onClick={() => navigate("/register")}>Create your free account <Icon.Arrow /></button><span className="closing-doodle">↗</span></div></section>;
}

function Footer() {
  const navigate = useNavigate();
  return <footer className="landing-footer">
    <div className="footer-main">
      <div className="footer-brand"><BrandLogo />
      <p>Career intelligence for better-informed moves.</p><small>© {new Date().getFullYear()} HireBot. All rights reserved.</small></div><div className="footer-column"><b>EXPLORE</b><button onClick={() => navigate("/jobs")}>Find jobs</button><button onClick={() => navigate("/resume-analyzer")}>Resume analyzer</button><button onClick={() => navigate("/recruiter")}>For recruiters</button></div><div className="footer-column"><b>ACCOUNT</b><button onClick={() => navigate("/pricing")}>Pricing</button><button onClick={() => navigate("/login")}>Sign in</button><button onClick={() => navigate("/register")}>Create account</button></div></div><div className="footer-bottom"><span>Made for the next move.</span><span>HIREBOT / CAREER INTELLIGENCE</span></div></footer>;
}

export default function HirebotLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return <div className="hirebot-landing-page">
    <ScrollProgress />
    <Navbar onOpenMenu={() => setMobileMenuOpen(true)} />
    <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    <main><Hero /><StorySection /><FeaturesSection /><HowItWorks /><PricingSection /><CallToAction /></main>
    <Footer />
  </div>;
}