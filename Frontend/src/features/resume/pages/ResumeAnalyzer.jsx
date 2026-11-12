import React, { useState, useRef, useCallback, useEffect } from "react";
import Sidebar from "../../shared/Sidebar";
import { analyzeResume, rewriteBullet, downloadResumePdf } from "../services/resume.api";
import "../styles/analyzer.scss";

const STORAGE_KEY = "hirebot_resume_result";

// ─── Map backend → display shape (with scoreBreakdown fallback) ───────────────
function formatForDisplay(data) {
  // If Gemini returned empty/zero scoreBreakdown, build it from basic scores.
  // This fixes the "Why This Score 0 0 0 0 0" bug.
  const rawBD = data.scoreBreakdown || [];
  const validBD = rawBD.filter((b) => b.score > 0 && String(b.factor || "").trim());
  const scoreBreakdown = validBD.length >= 3 ? validBD : [
    {
      factor: "Technical Skills Coverage",
      score:  Number(data.skillsMatch)     || 0,
      reason: "Percentage of required technical skills found in your resume",
    },
    {
      factor: "Experience Depth",
      score:  Number(data.experienceMatch) || 0,
      reason: "How well your experience level and depth match the role requirements",
    },
    {
      factor: "Keyword Alignment",
      score:  Number(data.keywordsMatch)   || 0,
      reason: "Job description keyword presence and density in your resume",
    },
    {
      factor: "ATS Readability",
      score:  Number(data.atsScore)        || 0,
      reason: "How well your resume structure passes automated ATS screening filters",
    },
  ];

  return {
    resumeId:             data._id,
    score:                Number(data.overallScore)   || 0,
    breakdown: [
      { label: "Skills match",      pct: Number(data.skillsMatch)     || 0 },
      { label: "Experience match",  pct: Number(data.experienceMatch) || 0 },
      { label: "Keywords match",    pct: Number(data.keywordsMatch)   || 0 },
      { label: "ATS compatibility", pct: Number(data.atsScore)        || 0 },
    ],
    missingSkills:        data.missingSkills        || [],
    skillGaps:            data.skillGaps            || [],
    suggestions:          data.suggestions          || [],
    atsIssues:            data.problems             || [],
    bulletRewrites:       data.bulletRewrites        || [],
    goodParts:            data.goodParts             || [],
    weakParts:            data.weakParts             || [],
    scoreBreakdown,
    hiringDiagnosis:      data.hiringDiagnosis      || null,
    skillGapIntelligence: data.skillGapIntelligence || [],
    rankedSuggestions:    data.rankedSuggestions    || [],
    actionPlan:           data.actionPlan           || null,
    hiringOutlook:        data.hiringOutlook        || null,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const gradeFromScore = (s) => (s >= 80 ? "A" : s >= 65 ? "B" : s >= 50 ? "C" : "D");
const gradeLabel     = (g) => ({ A: "Excellent", B: "Good", C: "Average", D: "Poor" }[g]);
const gradeRead      = (g) => ({
  A: "Your resume lines up closely with this job description.",
  B: "A good match with a few gaps worth closing.",
  C: "A partial match. Targeted edits will raise it.",
  D: "There are significant gaps against this job description.",
}[g]);

// Tone → semantic class (good / warn / bad). Colour is always paired with text or an icon.
const toneOf = (p, hi = 70, mid = 45) => (p >= hi ? "good" : p >= mid ? "warn" : "bad");
const impactTone = (i) => ({ high: "bad", medium: "warn", low: "neutral" }[i] || "warn");

const formatSize = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} KB`;

const wordCount = (t) => (t.trim() ? t.trim().split(/\s+/).length : 0);

// ─── Motion hooks ─────────────────────────────────────────────────────────────
function usePrefersReducedMotion() {
  const [reduced] = useState(
    () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
  return reduced;
}

function useCountUp(target, reduced, duration = 1200) {
  const [val, setVal] = useState(reduced ? target : 0);
  useEffect(() => {
    if (reduced) { setVal(target); return undefined; }
    let raf, start;
    const step = (t) => {
      if (start === undefined) start = t;
      const p = Math.min((t - start) / duration, 1);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced, duration]);
  return val;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const Svg = ({ size = 16, sw = 2, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {children}
  </svg>
);
const UploadIcon    = ({ size = 18 }) => <Svg size={size}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></Svg>;
const FileTextIcon  = ({ size = 16 }) => <Svg size={size}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></Svg>;
const BrainIcon     = ({ size = 18 }) => <Svg size={size}><path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96-.46 2.5 2.5 0 01-1.07-4.69A3 3 0 016.5 9a2.5 2.5 0 01.5-5z"/><path d="M14.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 004.96-.46 2.5 2.5 0 001.07-4.69A3 3 0 0117.5 9a2.5 2.5 0 00-.5-5z"/></Svg>;
const CheckIcon     = ({ size = 14 }) => <Svg size={size} sw={2.5}><polyline points="20 6 9 17 4 12"/></Svg>;
const XIcon         = ({ size = 14 }) => <Svg size={size} sw={2.5}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Svg>;
const LightbulbIcon = ({ size = 14 }) => <Svg size={size}><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14"/></Svg>;
const WandIcon      = ({ size = 15 }) => <Svg size={size}><path d="M15 4V2m0 14v-2M8 9H2m14 0h-2M3.22 3.22l1.42 1.42m12.72 12.72l1.42 1.42M3.22 20.78l1.42-1.42M17.36 6.64l1.42-1.42"/><path d="M5 21l14-14"/></Svg>;
const AlertIcon     = ({ size = 16 }) => <Svg size={size}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Svg>;
const SparklesIcon  = ({ size = 14 }) => <Svg size={size}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z"/><path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5L5 17z"/></Svg>;
const FileCheckIcon = ({ size = 15 }) => <Svg size={size}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/></Svg>;
const CopyIcon      = ({ size = 13 }) => <Svg size={size}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></Svg>;
const DownloadIcon  = ({ size = 14 }) => <Svg size={size}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></Svg>;
const TrashIcon     = ({ size = 13 }) => <Svg size={size}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></Svg>;
const ChevronIcon   = ({ size = 14 }) => <Svg size={size}><polyline points="6 9 12 15 18 9"/></Svg>;

const ToneIcon = ({ tone }) =>
  tone === "good" ? <CheckIcon/> : tone === "warn" ? <AlertIcon size={14}/> : <XIcon/>;

// ─── Small shared pieces ──────────────────────────────────────────────────────
// Progress bar that grows from 0 on mount. Colour comes from the tone-* class.
function Bar({ pct, tone, label, className = "" }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const v = Math.max(0, Math.min(100, Number(pct) || 0));
  return (
    <div className={`az-track ${className}`} role="progressbar" aria-label={label}
      aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
      <div className={`az-fill tone-${tone}`} style={{ width: `${on ? v : 0}%` }}/>
    </div>
  );
}

function CopyButton({ text, label = "Copy", className = "" }) {
  const [copied, setCopied] = useState(false);
  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };
  return (
    <button type="button" className={`copy-btn ${copied ? "copied" : ""} ${className}`} onClick={onClick}>
      {copied ? <><CheckIcon size={12}/> Copied</> : <><CopyIcon/> {label}</>}
    </button>
  );
}

function CardHead({ icon, title, count, sub }) {
  return (
    <div className="card-head">
      {icon && <span className="card-icon">{icon}</span>}
      <div className="card-head-text">
        <h3 className="card-title">{title}</h3>
        {sub && <p className="card-sub">{sub}</p>}
      </div>
      {count !== undefined && <span className="card-count">{count}</span>}
    </div>
  );
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const reduced = usePrefersReducedMotion();
  const shown = useCountUp(score, reduced);
  const r = 52, circ = 2 * Math.PI * r;
  const grade = gradeFromScore(score);
  return (
    <div className="score-ring-wrap">
      <div className="score-ring" role="img" aria-label={`Match score ${score} out of 100, ${gradeLabel(grade)}`}>
        <svg viewBox="0 0 128 128" aria-hidden="true">
          <circle className="ring-bg" cx="64" cy="64" r={r}/>
          <circle className="ring-fg" cx="64" cy="64" r={r} strokeDasharray={`${(shown / 100) * circ} ${circ}`}/>
        </svg>
        <div className="score-num" aria-hidden="true">
          <span className="num">{shown}</span>
          <span className="denom">out of 100</span>
        </div>
      </div>
      <span className={`score-grade grade-${grade.toLowerCase()}`}>Grade {grade}: {gradeLabel(grade)}</span>
    </div>
  );
}

// ─── Upload Panel ─────────────────────────────────────────────────────────────
function UploadPanel({ file, onFile }) {
  const inputRef = useRef();
  const [drag, setDrag] = useState(false);
  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") onFile(f);
  }, [onFile]);
  const openPicker = () => inputRef.current.click();
  return (
    <div className="panel-card">
      <div className="panel-header">
        <div className="panel-title"><span className="panel-icon"><UploadIcon size={16}/></span>Your resume</div>
        <span className="panel-meta">PDF only, max 3MB</span>
      </div>
      <div className="panel-body">
        <div className={`upload-zone ${drag ? "drag-over" : ""} ${file ? "has-file" : ""}`}
          role={file ? undefined : "button"}
          tabIndex={file ? undefined : 0}
          aria-label={file ? undefined : "Upload resume PDF. Drop a file here or press Enter to browse."}
          onKeyDown={(e) => { if (!file && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openPicker(); } }}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
          onDrop={handleDrop} onClick={() => !file && openPicker()}>
          {file ? (
            <>
              <div className="upload-zone-icon success-icon"><FileCheckIcon/></div>
              <div className="file-name" title={file.name}><CheckIcon/> <span>{file.name}</span></div>
              <span className="file-size">Uploaded · {formatSize(file.size)}</span>
              <div className="upload-actions">
                <button type="button" className="upload-btn" onClick={(e) => { e.stopPropagation(); openPicker(); }}>Replace</button>
                <button type="button" className="upload-btn danger-btn" onClick={(e) => { e.stopPropagation(); onFile(null); }}>Remove file</button>
              </div>
            </>
          ) : (
            <>
              <div className="upload-zone-icon"><UploadIcon/></div>
              <div className="upload-title">Drop your resume here</div>
              <div className="upload-sub">or browse your files</div>
              <div className="file-formats"><span>PDF</span></div>
              <button type="button" className="upload-btn" onClick={(e) => { e.stopPropagation(); openPicker(); }}>Choose file</button>
            </>
          )}
        </div>
        <input ref={inputRef} id="az-resume-file" type="file" accept=".pdf" aria-label="Resume PDF file"
          style={{ display: "none" }} onChange={(e) => onFile(e.target.files[0] || null)}/>
      </div>
    </div>
  );
}

const ROLES = ["Software Engineer","Frontend Developer","Backend Engineer","Full Stack Developer",
  "Product Manager","Data Scientist","DevOps Engineer","Product Designer","Data Analyst",
  "Mobile Developer","Machine Learning Engineer"];

function JDPanel({ jd, setJd, role, setRole }) {
  return (
    <div className="panel-card">
      <div className="panel-header">
        <label className="panel-title" htmlFor="az-jd"><span className="panel-icon"><FileTextIcon/></span>Job description</label>
        <span className="panel-meta">{wordCount(jd)} words · {jd.length} chars</span>
      </div>
      <div className="panel-body">
        <textarea id="az-jd" className="jd-textarea"
          placeholder="Paste the full job description here: requirements, responsibilities and skills."
          value={jd} onChange={(e) => setJd(e.target.value)}/>
      </div>
      <div className="role-select-row">
        <label htmlFor="az-role">Target role</label>
        <select id="az-role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Auto-detect from JD</option>
          {ROLES.map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>
    </div>
  );
}

// ─── Scanning state (shown while the analysis request is running) ─────────────
const SCAN_STEPS = [
  "Reading your resume",
  "Extracting skills and experience",
  "Comparing against the job description",
  "Checking ATS compatibility",
  "Preparing your report",
];
const SCAN_LINES = [
  { w: 88 }, { w: 72, hl: 1 }, { w: 94 }, { w: 58 },
  { w: 90, hl: 2 }, { w: 76 }, { w: 84, hl: 3 }, { w: 52 }, { w: 92 }, { w: 68, hl: 4 },
];

function ScanPanel({ file, role }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, SCAN_STEPS.length - 1)), 2600);
    return () => clearInterval(id);
  }, []);
  return (
    <section className="scan-panel" aria-busy="true">
      <div className="scan-doc" aria-hidden="true">
        <div className="scan-doc-head">
          <span className="scan-avatar"/>
          <span className="scan-name-lines"><i style={{ width: "62%" }}/><i style={{ width: "38%" }}/></span>
        </div>
        {SCAN_LINES.map((l, i) => (
          <span key={i} className={`scan-line ${l.hl ? "hl" : ""}`}
            style={{ width: `${l.w}%`, "--d": `${(l.hl || 0) * 0.9 + 0.6}s` }}/>
        ))}
        <div className="scan-beam"/>
      </div>
      <div className="scan-info" role="status" aria-live="polite">
        <span className="az-kicker">Analyzing</span>
        <h2 className="scan-title">Reading <em>{file ? file.name : "your resume"}</em></h2>
        <p className="scan-sub">{role ? `Matching against ${role}.` : "Matching against your job description."} This usually takes a few seconds.</p>
        <ol className="scan-steps">
          {SCAN_STEPS.map((s, i) => (
            <li key={s} className={i < step ? "done" : i === step ? "active" : ""}>
              <span className="scan-step-mark">{i < step ? <CheckIcon size={12}/> : i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
        <div className="scan-progress"><div style={{ width: `${((step + 1) / SCAN_STEPS.length) * 100}%` }}/></div>
      </div>
    </section>
  );
}

// ─── Score Breakdown ──────────────────────────────────────────────────────────
function ScoreBreakdownCard({ breakdown }) {
  if (!breakdown?.length) return null;
  return (
    <section className="az-card score-breakdown-card">
      <CardHead icon={<SparklesIcon/>} title="Why this score" sub="Factor-by-factor breakdown"/>
      <div className="sbc-list">
        {breakdown.map((item, i) => {
          const t = toneOf(item.score);
          return (
            <div className="sbc-row" key={i}>
              <div className="sbc-top">
                <span className="sbc-factor">{item.factor || `Factor ${i + 1}`}</span>
                <Bar pct={item.score} tone={t} label={item.factor || `Factor ${i + 1}`}/>
                <span className={`sbc-score tone-${t}`}>{item.score}/100</span>
              </div>
              {item.reason && <p className="sbc-reason">{item.reason}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Hiring Outlook ───────────────────────────────────────────────────────────
function HiringOutlookCard({ outlook }) {
  if (!outlook) return null;
  const pct   = outlook.shortlistProbability || 0;
  const iConv = outlook.interviewConversion  || 0;
  const tone  = toneOf(pct);
  const label = pct >= 70 ? "Strong candidate" : pct >= 45 ? "Borderline" : "At risk of rejection";
  const riskTone = { low: "good", medium: "warn", high: "bad" }[outlook.riskLevel] || "warn";

  return (
    <section className="az-card hiring-outlook-card">
      <CardHead title="Hiring outlook" sub="An AI estimate from this resume and job description, not a real hiring probability."/>
      <div className="hoc-body">
        <span className={`status-badge tone-${tone}`}><ToneIcon tone={tone}/>{label}</span>
        <div className="hoc-metrics">
          <div className="hoc-metric">
            <span className="hoc-metric-label">Estimated shortlist likelihood</span>
            <Bar pct={pct} tone={tone} label="Estimated shortlist likelihood"/>
            <span className={`hoc-val tone-${tone}`}>{pct}%</span>
          </div>
          {iConv > 0 && (
            <div className="hoc-metric">
              <span className="hoc-metric-label">Interview pass rate, if shortlisted</span>
              <Bar pct={iConv} tone="info" label="Interview pass rate if shortlisted"/>
              <span className="hoc-val tone-info">{iConv}%</span>
            </div>
          )}
        </div>
        {outlook.riskLevel && (
          <div className="hoc-risk">
            <span>Risk level</span>
            <span className={`status-badge status-badge--sm tone-${riskTone}`}><ToneIcon tone={riskTone}/>{outlook.riskLevel}</span>
          </div>
        )}
        {outlook.verdict && <p className="hoc-verdict">{outlook.verdict}</p>}
        {outlook.rejectionReasons?.length > 0 && (
          <div className="hoc-reasons">
            <span className="mini-label">Top rejection risks</span>
            {outlook.rejectionReasons.map((r, i) => (
              <div className="hoc-reason" key={i}><XIcon/>{r}</div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Hiring Diagnosis ─────────────────────────────────────────────────────────
function HiringDiagnosisCard({ diagnosis }) {
  if (!diagnosis || (!diagnosis.primaryConcern && !diagnosis.strengths?.length)) return null;
  return (
    <section className="az-card hiring-diag-card">
      <CardHead icon={<AlertIcon/>} title="Hiring diagnosis"/>
      <div className="hd-body">
        {diagnosis.primaryConcern && (
          <div className="hd-primary">
            <span className="hd-label tone-bad"><XIcon size={12}/>Primary hiring blocker</span>
            <p>{diagnosis.primaryConcern}</p>
          </div>
        )}
        {diagnosis.secondaryGaps?.length > 0 && (
          <div className="hd-group">
            <span className="hd-label tone-warn"><AlertIcon size={12}/>Secondary concerns</span>
            {diagnosis.secondaryGaps.map((g, i) => <div className="hd-item" key={i}><span className="hd-bullet tone-warn"/>{g}</div>)}
          </div>
        )}
        {diagnosis.strengths?.length > 0 && (
          <div className="hd-group">
            <span className="hd-label tone-good"><CheckIcon size={12}/>What works in your favour</span>
            {diagnosis.strengths.map((s, i) => <div className="hd-item hd-item--good" key={i}><CheckIcon/>{s}</div>)}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Skill Gap Intelligence ───────────────────────────────────────────────────
function SkillGapIntelligenceCard({ gaps }) {
  const [open, setOpen] = useState(null);
  if (!gaps?.length) return null;
  const impactLabel = { high: "Critical", medium: "Important", low: "Optional" };
  return (
    <section className="az-card sgi-card">
      <CardHead icon={<AlertIcon/>} title="Skill gap intelligence" sub="Open a gap to see why it matters and how to fix it" count={gaps.length}/>
      <div className="sgi-list">
        {gaps.map((g, i) => {
          const isOpen = open === i;
          const t = impactTone(g.impact);
          return (
            <div className={`sgi-item ${isOpen ? "open" : ""}`} key={i}>
              <button type="button" className="sgi-item-header" aria-expanded={isOpen} aria-controls={`sgi-body-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}>
                <span className="sgi-skill">{g.skill}</span>
                <span className={`sgi-impact tone-${t}`}>{impactLabel[g.impact] || "Important"}</span>
                <span className="sgi-chevron"><ChevronIcon/></span>
              </button>
              {isOpen && (
                <div className="sgi-item-body" id={`sgi-body-${i}`}>
                  {g.whyMissing && (
                    <div className="sgi-field">
                      <span className="mini-label">Why it's absent from your resume</span>
                      <p>{g.whyMissing}</p>
                    </div>
                  )}
                  {g.hiringEffect && (
                    <div className="sgi-field sgi-field--effect">
                      <span className="mini-label">Impact on the hiring decision</span>
                      <p>{g.hiringEffect}</p>
                    </div>
                  )}
                  {g.fixPlan?.length > 0 && (
                    <div className="sgi-field">
                      <span className="mini-label">How to fix this</span>
                      <ul className="sgi-fix-list">
                        {g.fixPlan.map((step, j) => <li key={j}><CheckIcon/>{step}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Action Plan ─────────────────────────────────────────────────────────────
function ActionPlanCard({ plan }) {
  if (!plan || (!plan.mustFix?.length && !plan.nextPriority?.length && !plan.optional?.length)) return null;
  const sections = [
    { label: "Must fix first", note: "Highest hiring impact", items: plan.mustFix,      tone: "bad"  },
    { label: "Next priority",  note: "Do these once the first set is done", items: plan.nextPriority, tone: "warn" },
    { label: "Optional",       note: "Nice to have",       items: plan.optional,     tone: "good" },
  ].filter((s) => s.items?.length > 0);
  return (
    <section className="az-card action-plan-card">
      <CardHead icon={<LightbulbIcon/>} title="Action plan" sub="Work through these in order"/>
      <ol className="ap-body">
        {sections.map((sec, n) => (
          <li className={`ap-section tone-${sec.tone}`} key={sec.label}>
            <div className="ap-section-head">
              <span className="ap-step">{n + 1}</span>
              <span className="ap-section-label">{sec.label}</span>
              <span className="ap-section-note">{sec.note}</span>
            </div>
            {sec.items.map((item, i) => (
              <div className="ap-item" key={i}><div className="ap-dot"/><span>{item}</span></div>
            ))}
          </li>
        ))}
      </ol>
    </section>
  );
}

// ─── Ranked Suggestions ───────────────────────────────────────────────────────
function RankedSuggestionsCard({ suggestions }) {
  if (!suggestions?.length) return null;
  const byImpact = { high: [], medium: [], low: [] };
  suggestions.forEach((s) => (byImpact[s.impact] || byImpact.medium).push(s.text));
  const sections = [
    { key: "high",   label: "High impact",   note: "Do these first", tone: "bad" },
    { key: "medium", label: "Medium impact", note: "",               tone: "warn" },
    { key: "low",    label: "Low impact",    note: "",               tone: "neutral" },
  ];
  let n = 0;
  return (
    <section className="az-card ranked-suggestions-card">
      <CardHead icon={<LightbulbIcon/>} title="Ranked improvements" sub="Most important first"/>
      <div className="rsc-body">
        {sections.map((sec) => byImpact[sec.key].length > 0 ? (
          <div className="rsc-group" key={sec.key}>
            <div className={`rsc-group-label tone-${sec.tone}`}>
              <span className="priority-chip">{sec.label}</span>{sec.note && <span className="rsc-note">{sec.note}</span>}
            </div>
            {byImpact[sec.key].map((text, i) => {
              n += 1;
              return (
                <div className="rsc-item" key={i}>
                  <span className="rsc-rank">{n}</span>
                  <span>{text}</span>
                </div>
              );
            })}
          </div>
        ) : null)}
      </div>
    </section>
  );
}

// ─── Results ──────────────────────────────────────────────────────────────────
function Results({ data, jobRole, onClear }) {
  const [bullet,      setBullet]      = useState("");
  const [rewriting,   setRewriting]   = useState(false);
  const [rewritten,   setRewritten]   = useState("");
  const [explanation, setExplanation] = useState("");
  const [downloading, setDownloading] = useState(false);

  const handleRewrite = async () => {
    if (!bullet.trim()) return;
    setRewriting(true); setRewritten(""); setExplanation("");
    try {
      const res = await rewriteBullet({ bulletPoint: bullet, jobRole, jobDescription: "" });
      if (res.success) { setRewritten(res.data?.improved || ""); setExplanation(res.data?.explanation || ""); }
    } catch { setRewritten("Could not rewrite. Please try again."); }
    finally  { setRewriting(false); }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const blob = await downloadResumePdf(data.resumeId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "optimized_resume.pdf"; a.click();
      URL.revokeObjectURL(url);
    } catch { alert("PDF generation failed. Please try again."); }
    finally { setDownloading(false); }
  };

  const grade = gradeFromScore(data.score);
  const skillsPct = data.breakdown[0]?.pct || 0;

  return (
    <div className="results-section">

      {/* Score hero: the focal point */}
      <section className="score-hero">
        <div className="score-main">
          <span className="az-kicker">Resume match score</span>
          <ScoreRing score={data.score}/>
          <p className="score-read">{gradeRead(grade)}</p>
        </div>
        <div className="score-breakdown">
          <div className="breakdown-header">
            <h2 className="breakdown-title">Match breakdown</h2>
            <p className="breakdown-sub">Your resume compared with the job description</p>
          </div>
          {data.breakdown.map((b) => {
            const t = toneOf(b.pct, 75, 50);
            return (
              <div className="breakdown-bar-row" key={b.label}>
                <span className="bar-label">{b.label}</span>
                <Bar pct={b.pct} tone={t} label={b.label}/>
                <span className="bar-pct">{b.pct}%</span>
              </div>
            );
          })}
          <div className="score-hero-actions">
            <button type="button" className="btn btn--primary" onClick={handleDownloadPdf} disabled={downloading}>
              <DownloadIcon/> {downloading ? "Generating PDF…" : "Download optimized resume"}
            </button>
            <button type="button" className="btn btn--secondary" onClick={onClear}><TrashIcon/> New analysis</button>
          </div>
        </div>
      </section>

      {/* Hiring outlook + diagnosis */}
      <div className="bento bento--2">
        <HiringOutlookCard outlook={data.hiringOutlook}/>
        <HiringDiagnosisCard diagnosis={data.hiringDiagnosis}/>
      </div>

      {/* Why this score */}
      <ScoreBreakdownCard breakdown={data.scoreBreakdown}/>

      {/* Skills bento */}
      <div className="bento bento--3">
        <section className="az-card result-card">
          <CardHead icon={<XIcon/>} title="Skills breakdown" count={data.missingSkills.length}/>
          <div className="coverage">
            <div className="coverage-row">
              <span>Skill coverage</span>
              <strong className={`tone-${toneOf(skillsPct, 75, 50)}`}>{skillsPct}%</strong>
            </div>
            <Bar pct={skillsPct} tone={toneOf(skillsPct, 75, 50)} label="Skill coverage"/>
          </div>
          <span className="mini-label">Missing skills</span>
          <div className="tag-list">
            {data.missingSkills.length > 0
              ? data.missingSkills.map((s) => <span className="tag tag--missing" key={s}><XIcon size={11}/>{s}</span>)
              : <span className="tag-empty">None detected</span>}
          </div>
        </section>
        <section className="az-card result-card">
          <CardHead icon={<AlertIcon/>} title="Skill gaps" count={data.skillGaps.length}/>
          <div className="gap-list">
            {data.skillGaps.length > 0
              ? data.skillGaps.map((g) => (
                <div className="gap-item" key={g.skill}>
                  <span className="gap-skill">{g.skill}</span>
                  <span className={`gap-severity tone-${impactTone(g.severity)}`}>{g.severity}</span>
                </div>
              ))
              : <span className="tag-empty">No critical gaps</span>}
          </div>
        </section>
        <section className="az-card result-card">
          <CardHead icon={<LightbulbIcon/>} title="AI suggestions" count={data.suggestions.length}/>
          <div className="suggestion-list">
            {data.suggestions.map((s, i) => (
              <div className="suggestion-item" key={i}>
                <div className="s-dot"/>
                <span className="s-text">{s}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ATS Issues */}
      {data.atsIssues.length > 0 && (
        <section className="ats-card">
          <div className="ats-icon"><AlertIcon/></div>
          <div className="ats-content">
            <h3 className="ats-title">ATS compatibility issues</h3>
            <div className="tag-list">
              {data.atsIssues.map((issue, i) => <span className="tag tag--warning" key={i}><AlertIcon size={11}/>{issue}</span>)}
            </div>
          </div>
        </section>
      )}

      {/* Skill Gap Intelligence */}
      <SkillGapIntelligenceCard gaps={data.skillGapIntelligence}/>

      {/* Action plan + ranked suggestions */}
      <div className="bento bento--2">
        <ActionPlanCard plan={data.actionPlan}/>
        <RankedSuggestionsCard suggestions={data.rankedSuggestions}/>
      </div>

      {/* Bullet rewrites from the analysis */}
      {data.bulletRewrites.length > 0 && (
        <section className="az-card rewrites-panel">
          <div className="card-head">
            <span className="card-icon"><WandIcon/></span>
            <div className="card-head-text">
              <h3 className="card-title">AI-generated bullet rewrites</h3>
              <p className="card-sub">Before and after, ready to copy</p>
            </div>
            <span className="ai-badge"><span className="ai-dot"/> Gemini</span>
          </div>
          <div className="rewrites-list">
            {data.bulletRewrites.map((r, i) => (
              <div className="rewrite-item-block" key={i}>
                <div className="rewrite-before"><span className="rewrite-label before">Original</span>{r.original}</div>
                <div className="rewrite-after">
                  <span className="rewrite-label after">Improved</span>{r.improved}
                  <div className="rewrite-actions"><CopyButton text={r.improved || ""} label="Copy improved"/></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Good / Weak parts */}
      {(data.goodParts.length > 0 || data.weakParts.length > 0) && (
        <div className="parts-grid">
          {data.goodParts.length > 0 && (
            <section className="parts-col parts-col--good">
              <h3 className="parts-col-title"><CheckIcon/> Strong sections</h3>
              {data.goodParts.map((p, i) => <div className="parts-item" key={i}>{p}</div>)}
            </section>
          )}
          {data.weakParts.length > 0 && (
            <section className="parts-col parts-col--weak">
              <h3 className="parts-col-title"><XIcon/> Needs improvement</h3>
              {data.weakParts.map((p, i) => <div className="parts-item" key={i}>{p}</div>)}
            </section>
          )}
        </div>
      )}

      {/* Manual bullet rewriter */}
      <section className="az-card rewrite-panel">
        <div className="card-head">
          <span className="card-icon"><WandIcon/></span>
          <div className="card-head-text">
            <h3 className="card-title">AI bullet point rewriter</h3>
            <p className="card-sub">Paste a weak bullet and get a stronger version</p>
          </div>
          <span className="ai-badge"><span className="ai-dot"/> AI powered</span>
        </div>
        <div className="rewrite-body">
          <div className="bullet-input-row">
            <textarea aria-label="Resume bullet point to rewrite"
              placeholder='Paste a weak bullet, e.g. "Worked on backend features and fixed bugs"'
              value={bullet} onChange={(e) => setBullet(e.target.value)}/>
            <button type="button" className="btn btn--primary rewrite-btn" onClick={handleRewrite} disabled={rewriting || !bullet.trim()}>
              {rewriting ? "Rewriting…" : <><SparklesIcon/> Improve</>}
            </button>
          </div>
          {(rewritten || rewriting) && (
            <div className="rewrite-output" aria-live="polite">
              {rewriting
                ? <span className="rewriting-msg">Rewriting your bullet point…</span>
                : <>
                    <div className="ro-block ro-block--before">
                      <span className="rewrite-label before">Original</span>
                      <p>{bullet}</p>
                    </div>
                    <div className="ro-block ro-block--after">
                      <span className="rewrite-label after">Improved</span>
                      <p className="rewrite-result">{rewritten}</p>
                      {explanation && <p className="rewrite-explanation">{explanation}</p>}
                      <CopyButton text={rewritten}/>
                    </div>
                  </>}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ResumeAnalyzer() {
  const [file,    setFile]    = useState(null);
  const [jd,      setJd]      = useState("");
  const [role,    setRole]    = useState("");
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState("");

  useEffect(() => {
    try { const s = sessionStorage.getItem(STORAGE_KEY); if (s) setResult(JSON.parse(s)); }
    catch { sessionStorage.removeItem(STORAGE_KEY); }
  }, []);

  useEffect(() => {
    if (result) { try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result)); } catch {} }
  }, [result]);

  const canAnalyze = !!file && jd.trim().length > 20;

  const handleAnalyze = async () => {
    setLoading(true); setError(""); setResult(null);
    sessionStorage.removeItem(STORAGE_KEY);
    try {
      const res = await analyzeResume({ file, jobDescription: jd, jobRole: role });
      if (res.success) setResult(formatForDisplay(res.data));
      else setError(res.message || "Analysis failed.");
    } catch (err) { setError(err.response?.data?.message || "Failed to analyze. Please try again."); }
    finally { setLoading(false); }
  };

  const handleClear = () => {
    setResult(null); setFile(null); setJd(""); setRole(""); setError("");
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="analyzer-layout">
      <Sidebar/>
      <div className="analyzer-main">
        <main className="analyzer-body">
          <header className="az-header">
            <div className="az-header-text">
              <h1 className="az-title">Resume <em>Analyzer</em></h1>
              <p className="az-lede">
                Upload your resume, paste the job description, and get a match score, the skills you're missing and a plan to close the gap.
              </p>
            </div>
            <div className="status-pill"><span className="dot"/> AI online</div>
          </header>

          {!result && loading && <ScanPanel file={file} role={role}/>}

          {!result && !loading && (
            <>
              <div className="input-panels">
                <UploadPanel file={file} onFile={setFile}/>
                <JDPanel jd={jd} setJd={setJd} role={role} setRole={setRole}/>
              </div>
              <div className="analyze-btn-row">
                <button type="button" className="btn btn--primary btn--lg analyze-btn"
                  onClick={handleAnalyze} disabled={!canAnalyze}>
                  <SparklesIcon/> Analyze resume
                </button>
                {!canAnalyze && <p className="analyze-hint">Upload a PDF resume and paste a job description to begin.</p>}
              </div>
              {error && <p className="error-msg" role="alert"><AlertIcon size={15}/> {error}</p>}
              {canAnalyze && (
                <div className="empty-state">
                  <div className="empty-icon"><BrainIcon/></div>
                  <p>Select "Analyze resume" to get your match score, skill gaps and improvement tips.</p>
                </div>
              )}
            </>
          )}

          {result && <Results data={result} jobRole={role} onClear={handleClear}/>}
        </main>
      </div>
    </div>
  );
}