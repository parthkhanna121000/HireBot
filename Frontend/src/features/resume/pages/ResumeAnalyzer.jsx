import React, { useState, useRef, useCallback } from "react";
import "../styles/analyzer.scss";

// ─── Icons ─────────────────────────────────────────────────────────────────
const Icon = {
  Upload: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  FileText: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  Brain: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96-.46 2.5 2.5 0 01-1.07-4.69A3 3 0 016.5 9a2.5 2.5 0 01.5-5z"/>
      <path d="M14.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 004.96-.46 2.5 2.5 0 001.07-4.69A3 3 0 0017.5 9a2.5 2.5 0 00-.5-5z"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Lightbulb: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/>
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14"/>
    </svg>
  ),
  Wand: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 4V2m0 14v-2M8 9H2m14 0h-2M3.22 3.22l1.42 1.42m12.72 12.72l1.42 1.42M3.22 20.78l1.42-1.42M17.36 6.64l1.42-1.42"/>
      <path d="M5 21l14-14"/>
    </svg>
  ),
  Grid: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Briefcase: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
    </svg>
  ),
  Users: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  History: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
    </svg>
  ),
  Copy: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Sparkles: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/>
      <path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z"/>
      <path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5L5 17z"/>
    </svg>
  ),
  FileCheck: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <path d="M9 15l2 2 4-4"/>
    </svg>
  ),
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const gradeFromScore = (s) => {
  if (s >= 80) return "A";
  if (s >= 65) return "B";
  if (s >= 50) return "C";
  return "D";
};

const gradeLabel = (g) => ({ A: "Excellent", B: "Good", C: "Average", D: "Poor" }[g]);

const barColor = (pct) => {
  if (pct >= 75) return "linear-gradient(90deg, #0ea5a0, #10d9a0)";
  if (pct >= 50) return "linear-gradient(90deg, #d97706, #fbbf24)";
  return "linear-gradient(90deg, #e11d48, #fb7185)";
};

const ringColor = (s) => {
  if (s >= 80) return "#10d9a0";
  if (s >= 65) return "#6366f1";
  if (s >= 50) return "#fbbf24";
  return "#fb7185";
};

// ─── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar() {
  const nav = [
    { label: "Dashboard",       icon: <Icon.Grid />,      active: false, badge: null },
    { label: "Resume Analyzer", icon: <Icon.Brain />,     active: true,  badge: "AI" },
    { label: "Job Listings",    icon: <Icon.Briefcase />, active: false, badge: "24" },
    { label: "Applications",    icon: <Icon.Users />,     active: false, badge: null },
  ];

  return (
    <aside className="analyzer-sidebar">
      <div className="sidebar-logo">
        {/* <div className="logo-mark">H</div> */}
        <span className="logo-text">Hire<span>BotAI</span></span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-label">Navigation</div>
          {nav.map((n) => (
            <button key={n.label} className={`nav-item ${n.active ? "active" : ""}`}>
              <div className="nav-icon">{n.icon}</div>
              {n.label}
              {n.badge && <span className="nav-badge">{n.badge}</span>}
            </button>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-row">
          <div className="user-avatar">JD</div>
          <div className="user-info">
            <div className="user-name">John Doe</div>
            <div className="user-email">john@example.com</div>
          </div>
          <div className="user-chevron"><Icon.ChevronRight /></div>
        </div>
      </div>
    </aside>
  );
}

// ─── Score Ring ─────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 50;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = ringColor(score);
  const grade = gradeFromScore(score);

  return (
    <div className="score-circle-wrap">
      <div className="score-ring">
        <svg width="124" height="124" viewBox="0 0 124 124">
          <circle cx="62" cy="62" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
          <circle
            cx="62" cy="62" r={r} fill="none"
            stroke={color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circ}`}
            style={{ transition: "stroke-dasharray 1.4s cubic-bezier(0.22, 1, 0.36, 1)", filter: `drop-shadow(0 0 8px ${color}66)` }}
          />
        </svg>
        <div className="score-num">
          <span className="num">{score}</span>
          <span className="denom">/100</span>
        </div>
      </div>
      <span className={`score-grade ${grade}`}>{gradeLabel(grade)}</span>
    </div>
  );
}

// ─── Upload Panel ───────────────────────────────────────────────────────────
function UploadPanel({ file, onFile }) {
  const inputRef = useRef();
  const [drag, setDrag] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }, [onFile]);

  return (
    <div className="panel-card">
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-icon" style={{ background: "rgba(99,102,241,0.12)", color: "#a5b4fc" }}>
            <Icon.Upload />
          </div>
          Upload Resume
        </div>
        <span className="panel-meta">PDF · DOC · DOCX</span>
      </div>
      <div className="panel-body">
        <div
          className={`upload-zone ${drag ? "drag-over" : ""} ${file ? "has-file" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          onClick={() => !file && inputRef.current.click()}
        >
          {file ? (
            <>
              <div className="upload-icon" style={{ background: "rgba(16,217,160,0.15)", color: "#10d9a0" }}>
                <Icon.FileCheck />
              </div>
              <div className="file-name">
                <Icon.Check />
                {file.name}
              </div>
              <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "JetBrains Mono, monospace" }}>
                {(file.size / 1024).toFixed(1)} KB
              </span>
              <button
                className="upload-btn"
                style={{ background: "rgba(251,113,133,0.15)", color: "#fb7185", boxShadow: "none" }}
                onClick={(e) => { e.stopPropagation(); onFile(null); }}
              >
                Remove file
              </button>
            </>
          ) : (
            <>
              <div className="upload-icon">
                <Icon.Upload />
              </div>
              <div className="upload-title">Drop your resume here</div>
              <div className="upload-sub">or click to browse files</div>
              <div className="file-formats">
                <span>PDF</span><span>DOC</span><span>DOCX</span>
              </div>
              <button className="upload-btn" onClick={(e) => { e.stopPropagation(); inputRef.current.click(); }}>
                Choose file
              </button>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          style={{ display: "none" }}
          onChange={(e) => onFile(e.target.files[0] || null)}
        />
      </div>
    </div>
  );
}

// ─── JD Panel ───────────────────────────────────────────────────────────────
function JDPanel({ jd, setJd, role, setRole }) {
  const roles = [
    "Software Engineer", "Frontend Developer", "Backend Engineer",
    "Full Stack Developer", "Product Manager", "Data Analyst",
    "Data Scientist", "DevOps Engineer", "Product Designer",
    "Marketing Manager", "Business Analyst",
  ];

  return (
    <div className="panel-card">
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-icon" style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24" }}>
            <Icon.FileText />
          </div>
          Job Description
        </div>
        <span className="panel-meta">{jd.length} chars</span>
      </div>
      <div className="panel-body">
        <textarea
          className="jd-textarea"
          placeholder="Paste the full job description here — requirements, responsibilities, and skills…"
          value={jd}
          onChange={(e) => setJd(e.target.value)}
        />
      </div>
      <div className="role-select-row">
        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Auto-detect</option>
          {roles.map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>
    </div>
  );
}

// ─── Results ────────────────────────────────────────────────────────────────
function Results({ data }) {
  const [bullet, setBullet] = useState("");
  const [rewritten, setRewritten] = useState("");
  const [rewriting, setRewriting] = useState(false);
  const [copied, setCopied] = useState(false);

  const grade = gradeFromScore(data.score);

  const handleRewrite = async () => {
    if (!bullet.trim()) return;
    setRewriting(true);
    setRewritten("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are an expert resume writer. Rewrite this resume bullet point to be stronger, more impactful, and ATS-friendly. Use action verbs, quantify impact where possible, keep it 1-2 lines. Return ONLY the rewritten bullet point.\n\nOriginal: "${bullet}"`,
          }],
        }),
      });
      const json = await res.json();
      const text = json.content?.map((c) => c.text || "").join("") || "Could not rewrite. Please try again.";
      setRewritten(text.trim());
    } catch {
      setRewritten("Error connecting to AI. Please try again.");
    } finally {
      setRewriting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rewritten);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="results-section">

      {/* Score Hero */}
      <div className="score-hero">
        <ScoreRing score={data.score} />
        <div className="score-breakdown">
          <div className="breakdown-header">
            <div className="breakdown-title">Match Breakdown</div>
            <div className="breakdown-sub">vs. job description</div>
          </div>
          {data.breakdown.map((b) => (
            <div className="breakdown-bar-row" key={b.label}>
              <span className="bar-label">{b.label}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${b.pct}%`, background: barColor(b.pct) }} />
              </div>
              <span className="bar-pct">{b.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Three-col cards */}
      <div className="results-grid">

        <div className="result-card">
          <div className="rc-header">
            <div className="rc-icon" style={{ background: "rgba(251,113,133,0.12)", color: "#fb7185" }}>
              <Icon.X />
            </div>
            <span className="rc-title">Missing Skills</span>
            <span className="rc-count">{data.missingSkills.length}</span>
          </div>
          <div className="tag-list">
            {data.missingSkills.map((s) => <span className="tag missing" key={s}>{s}</span>)}
          </div>
        </div>

        <div className="result-card">
          <div className="rc-header">
            <div className="rc-icon" style={{ background: "rgba(16,217,160,0.12)", color: "#10d9a0" }}>
              <Icon.Check />
            </div>
            <span className="rc-title">Matched Skills</span>
            <span className="rc-count">{data.matchedSkills.length}</span>
          </div>
          <div className="tag-list">
            {data.matchedSkills.map((s) => <span className="tag good" key={s}>{s}</span>)}
          </div>
        </div>

        <div className="result-card">
          <div className="rc-header">
            <div className="rc-icon" style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24" }}>
              <Icon.Lightbulb />
            </div>
            <span className="rc-title">AI Suggestions</span>
            <span className="rc-count">{data.suggestions.length}</span>
          </div>
          <div className="suggestion-list">
            {data.suggestions.map((s, i) => (
              <div className="suggestion-item" key={i}>
                <div className={`s-dot ${["blue", "green", "amber", "violet", "green"][i % 5]}`} />
                <span className="s-text">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ATS Issues */}
      {data.atsIssues.length > 0 && (
        <div className="ats-card">
          <div className="ats-icon"><Icon.AlertTriangle /></div>
          <div className="ats-content">
            <div className="ats-title">ATS Compatibility Issues</div>
            <div className="tag-list">
              {data.atsIssues.map((issue) => <span className="tag warning" key={issue}>{issue}</span>)}
            </div>
          </div>
        </div>
      )}

      {/* AI Rewrite */}
      <div className="rewrite-panel">
        <div className="rewrite-header">
          <div className="rw-title">
            <Icon.Wand />
            AI Bullet Point Rewriter
          </div>
          <span className="ai-badge">
            <div className="ai-dot" />
            Powered by Claude
          </span>
        </div>

        <div className="rewrite-body">
          <div className="bullet-input-row">
            <textarea
              placeholder='Paste a weak bullet — e.g. "Worked on backend features and fixed bugs"'
              value={bullet}
              onChange={(e) => setBullet(e.target.value)}
            />
            <button
              className="rewrite-btn"
              onClick={handleRewrite}
              disabled={rewriting || !bullet.trim()}
            >
              {rewriting ? "Rewriting…" : "✦ Improve"}
            </button>
          </div>

          {(rewritten || rewriting) && (
            <div className="rewrite-output">
              {rewriting
                ? <span style={{ color: "#6b7280" }}>Claude is crafting your bullet point…</span>
                : <span className="rewrite-result">{rewritten}</span>
              }
              {rewritten && !rewriting && (
                <button className={`copy-btn ${copied ? "copied" : ""}`} onClick={handleCopy}>
                  {copied ? "✓ Copied" : <><Icon.Copy /> Copy</>}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Highlighted Resume */}
      <div className="highlighted-resume">
        <div className="hr-header">
          <span className="hr-title">Resume Highlights</span>
          <div className="hr-legend">
            <div className="legend-item"><div className="legend-dot good" /> Strong</div>
            <div className="legend-item"><div className="legend-dot issue" /> Needs work</div>
          </div>
        </div>
        <div className="hr-body">
          {data.highlightedLines.map((line, i) => (
            <div className="resume-line" key={i}>
              {line.type === "section" ? (
                <div className="resume-section-title">{line.text}</div>
              ) : line.parts ? (
                <div>
                  {line.parts.map((p, j) => (
                    p.highlight === "good"  ? <span className="hl-good"  key={j}>{p.text}</span>
                  : p.highlight === "issue" ? <span className="hl-issue" key={j}>{p.text}</span>
                  : <span key={j}>{p.text}</span>
                  ))}
                </div>
              ) : (
                <div>{line.text}</div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─── Mock data ──────────────────────────────────────────────────────────────
const MOCK_RESULT = {
  score: 74,
  breakdown: [
    { label: "Skills match",      pct: 82 },
    { label: "Experience match",  pct: 71 },
    { label: "Keywords match",    pct: 68 },
    { label: "ATS compatibility", pct: 75 },
  ],
  missingSkills: ["Docker", "Kubernetes", "CI/CD", "TypeScript", "GraphQL"],
  matchedSkills: ["React", "Node.js", "REST APIs", "Git", "Agile", "MongoDB"],
  suggestions: [
    "Add quantified achievements — e.g. 'reduced load time by 40%' instead of 'improved performance'.",
    "Include Docker and Kubernetes experience or list them as skills you are learning.",
    "Your summary section is missing — add a 2-line professional summary at the top.",
    "Use more action verbs: 'Architected', 'Optimized', 'Delivered', 'Led'.",
    "Add a Skills section near the top for faster ATS parsing.",
  ],
  atsIssues: ["No skills section detected", "Tables or columns may break ATS parsing", "Missing contact email"],
  highlightedLines: [
    { type: "section", text: "Experience" },
    { parts: [{ text: "Software Engineer at " }, { text: "Acme Corp", highlight: "good" }, { text: " (2022–Present)" }] },
    { parts: [{ text: "• " }, { text: "Built REST APIs", highlight: "good" }, { text: " using Node.js for internal dashboards" }] },
    { parts: [{ text: "• " }, { text: "Worked on frontend tasks", highlight: "issue" }, { text: " (vague — add specifics and metrics)" }] },
    { parts: [{ text: "• " }, { text: "React components", highlight: "good" }, { text: " developed for 3 client-facing products" }] },
    { parts: [{ text: "• " }, { text: "Fixed bugs and did testing", highlight: "issue" }, { text: " (too vague — be specific)" }] },
    { type: "section", text: "Skills" },
    { parts: [{ text: "React, Node.js, MongoDB, " }, { text: "Git", highlight: "good" }, { text: ", JavaScript" }] },
    { parts: [{ text: "Missing: " }, { text: "Docker, Kubernetes, TypeScript", highlight: "issue" }] },
    { type: "section", text: "Education" },
    { parts: [{ text: "B.Tech Computer Science — " }, { text: "Delhi University", highlight: "good" }, { text: " (2018–2022)" }] },
  ],
};

// ─── AI Analysis ────────────────────────────────────────────────────────────
async function runAnalysis(resumeText, jd, role) {
  const prompt = `You are an expert ATS resume analyzer and career coach.

Analyze this resume against the job description and return ONLY valid JSON (no markdown, no explanation).

Resume:
${resumeText || "[No resume text extracted — use realistic mock data for a software engineer]"}

Job Description:
${jd || "[No JD provided — analyze resume generally]"}

Target Role: ${role || "Auto-detect"}

Return this exact JSON structure:
{
  "score": <number 0-100>,
  "breakdown": [
    { "label": "Skills match",      "pct": <0-100> },
    { "label": "Experience match",  "pct": <0-100> },
    { "label": "Keywords match",    "pct": <0-100> },
    { "label": "ATS compatibility", "pct": <0-100> }
  ],
  "missingSkills": [<up to 6 skill strings>],
  "matchedSkills": [<up to 6 skill strings>],
  "suggestions":   [<5 specific actionable suggestion strings>],
  "atsIssues":     [<up to 4 ATS problem strings, empty array if none>],
  "highlightedLines": [
    { "type": "section", "text": "<section name>" },
    { "parts": [ { "text": "<text>", "highlight": "<good|issue|none>" } ] }
  ]
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  const text = data.content?.map((c) => c.text || "").join("") || "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function ResumeAnalyzer() {
  const [file, setFile]       = useState(null);
  const [jd, setJd]           = useState("");
  const [role, setRole]       = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState("");

  const canAnalyze = file || jd.trim().length > 20;

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await runAnalysis("", jd, role);
      setResult(data);
    } catch {
      setResult(MOCK_RESULT);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analyzer-layout">
      <Sidebar />

      <div className="analyzer-main">
        {/* Topbar */}
        <header className="analyzer-topbar">
          <div className="topbar-left">
            <div className="topbar-title">Resume Analyzer</div>
            <div className="topbar-sub">AI-powered matching & optimization</div>
          </div>
          <div className="topbar-actions">
            <div className="status-pill">
              <div className="dot" />
              AI Online
            </div>
            <button className="topbar-btn">
              <Icon.History /> Past analyses
            </button>
          </div>
        </header>

        {/* Body */}
        <main className="analyzer-body">

          <div className="section-heading">
            <span className="sh-label">Input</span>
          </div>

          <div className="input-panels">
            <UploadPanel file={file} onFile={setFile} />
            <JDPanel jd={jd} setJd={setJd} role={role} setRole={setRole} />
          </div>

          <div className="analyze-btn-row">
            <button
              className={`analyze-btn ${loading ? "loading" : ""}`}
              onClick={handleAnalyze}
              disabled={loading || !canAnalyze}
            >
              {loading ? (
                <><div className="spinner" /> Analyzing with AI…</>
              ) : (
                <><Icon.Sparkles /> Analyze Resume</>
              )}
            </button>
            {!canAnalyze && !result && (
              <p className="analyze-hint">
                Upload a resume or paste a job description to begin
              </p>
            )}
          </div>

          {error && (
            <p style={{ textAlign: "center", fontSize: 13, color: "#fb7185" }}>{error}</p>
          )}

          {!result && !loading && canAnalyze && (
            <div className="empty-state">
              <div className="empty-icon"><Icon.Brain /></div>
              <p>Click "Analyze Resume" to get your AI-powered match score, skill gaps, and improvement tips.</p>
            </div>
          )}

          {result && (
            <>
              <div className="section-heading" style={{ marginTop: "0.5rem" }}>
                <span className="sh-label">Results</span>
              </div>
              <Results data={result} />
            </>
          )}

        </main>
      </div>
    </div>
  );
}