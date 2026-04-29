
import React, { useState, useRef, useCallback, useEffect } from "react";
import Sidebar from "../../shared/Sidebar";
import { analyzeResume, rewriteBullet, downloadResumePdf } from "../services/resume.api";
import "../styles/analyzer.scss";

const STORAGE_KEY = "hirebot_resume_result";

// ─── Map backend → display shape (with scoreBreakdown fallback) ───────────────
function formatForDisplay(data) {
  // ── scoreBreakdown fallback ───────────────────────────────────────────────
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

// ─── Color helpers ────────────────────────────────────────────────────────────
const gradeFromScore = (s) => (s >= 80 ? "A" : s >= 65 ? "B" : s >= 50 ? "C" : "D");
const gradeLabel     = (g) => ({ A: "Excellent", B: "Good", C: "Average", D: "Poor" }[g]);
const barColor = (p) =>
  p >= 75 ? "linear-gradient(90deg,#059669,#10b981)"
  : p >= 50 ? "linear-gradient(90deg,#d97706,#f59e0b)"
  : "linear-gradient(90deg,#be123c,#f43f5e)";
const ringColor  = (s) => (s >= 80 ? "#10b981" : s >= 65 ? "#6366f1" : s >= 50 ? "#f59e0b" : "#f43f5e");
const severityFg = (s) => ({ high: "#f43f5e", medium: "#f59e0b", low: "#a5b4fc" }[s] || "#8888aa");
const severityBg = (s) => ({ high: "rgba(244,63,94,0.12)", medium: "rgba(245,158,11,0.12)", low: "rgba(99,102,241,0.12)" }[s] || "rgba(255,255,255,0.04)");
const impactColor = (i) => ({ high: "#f43f5e", medium: "#f59e0b", low: "#6d6d8a" }[i] || "#6d6d8a");

// ─── Icons ────────────────────────────────────────────────────────────────────
const UploadIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const FileTextIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const BrainIcon     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96-.46 2.5 2.5 0 01-1.07-4.69A3 3 0 016.5 9a2.5 2.5 0 01.5-5z"/><path d="M14.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 004.96-.46 2.5 2.5 0 001.07-4.69A3 3 0 0117.5 9a2.5 2.5 0 00-.5-5z"/></svg>;
const CheckIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const XIcon         = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const LightbulbIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14"/></svg>;
const WandIcon      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2m0 14v-2M8 9H2m14 0h-2M3.22 3.22l1.42 1.42m12.72 12.72l1.42 1.42M3.22 20.78l1.42-1.42M17.36 6.64l1.42-1.42"/><path d="M5 21l14-14"/></svg>;
const AlertIcon     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const SparklesIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z"/><path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5L5 17z"/></svg>;
const FileCheckIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/></svg>;
const CopyIcon      = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>;
const DownloadIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const TrashIcon     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const TrendUpIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const TrendDownIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>;

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 50, circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ, color = ringColor(score), grade = gradeFromScore(score);
  return (
    <div className="score-circle-wrap">
      <div className="score-ring">
        <svg width="128" height="128" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10"/>
          <circle cx="64" cy="64" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${fill} ${circ}`}
            style={{ transition: "stroke-dasharray 1.5s cubic-bezier(0.22,1,0.36,1)", filter: `drop-shadow(0 0 10px ${color}88)` }}/>
        </svg>
        <div className="score-num"><span className="num">{score}</span><span className="denom">/100</span></div>
      </div>
      <span className={`score-grade grade-${grade.toLowerCase()}`}>{gradeLabel(grade)}</span>
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
  return (
    <div className="panel-card">
      <div className="panel-header">
        <div className="panel-title"><div className="panel-icon upload-icon-bg"><UploadIcon/></div>Upload Resume</div>
        <span className="panel-meta">PDF only · max 3MB</span>
      </div>
      <div className="panel-body">
        <div className={`upload-zone ${drag ? "drag-over" : ""} ${file ? "has-file" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
          onDrop={handleDrop} onClick={() => !file && inputRef.current.click()}>
          {file ? (
            <>
              <div className="upload-zone-icon success-icon"><FileCheckIcon/></div>
              <div className="file-name"><CheckIcon/> {file.name}</div>
              <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
              <button className="upload-btn danger-btn" onClick={(e) => { e.stopPropagation(); onFile(null); }}>Remove file</button>
            </>
          ) : (
            <>
              <div className="upload-zone-icon"><UploadIcon/></div>
              <div className="upload-title">Drop your resume here</div>
              <div className="upload-sub">or click to browse files</div>
              <div className="file-formats"><span>PDF</span></div>
              <button className="upload-btn" onClick={(e) => { e.stopPropagation(); inputRef.current.click(); }}>Choose file</button>
            </>
          )}
        </div>
        <input ref={inputRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={(e) => onFile(e.target.files[0] || null)}/>
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
        <div className="panel-title"><div className="panel-icon jd-icon-bg"><FileTextIcon/></div>Job Description</div>
        <span className="panel-meta">{jd.length} chars</span>
      </div>
      <div className="panel-body">
        <textarea className="jd-textarea"
          placeholder="Paste the full job description here — requirements, responsibilities, and skills…"
          value={jd} onChange={(e) => setJd(e.target.value)}/>
      </div>
      <div className="role-select-row">
        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Auto-detect from JD</option>
          {ROLES.map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>
    </div>
  );
}

// ─── Score Breakdown (fixed) ──────────────────────────────────────────────────
function ScoreBreakdownCard({ breakdown }) {
  if (!breakdown?.length) return null;
  return (
    <div className="score-breakdown-card">
      <div className="sbc-header">
        <SparklesIcon/> Why this score — factor breakdown
      </div>
      <div className="sbc-list">
        {breakdown.map((item, i) => (
          <div className="sbc-row" key={i}>
            <div className="sbc-top">
              <span className="sbc-factor">{item.factor || `Factor ${i + 1}`}</span>
              <div className="sbc-track">
                <div className="sbc-fill" style={{ width: `${item.score}%`, background: barColor(item.score) }}/>
              </div>
              <span className="sbc-score" style={{ color: item.score >= 70 ? "#10b981" : item.score >= 45 ? "#f59e0b" : "#f43f5e" }}>
                {item.score}/100
              </span>
            </div>
            {item.reason && <p className="sbc-reason">{item.reason}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Hiring Outlook ───────────────────────────────────────────────────────────
function HiringOutlookCard({ outlook }) {
  if (!outlook) return null;
  const pct   = outlook.shortlistProbability || 0;
  const iConv = outlook.interviewConversion  || 0;
  const color = pct >= 70 ? "#10b981" : pct >= 45 ? "#f59e0b" : "#f43f5e";
  const label = pct >= 70 ? "Strong candidate" : pct >= 45 ? "Borderline" : "At risk of rejection";
  const riskEmoji = { low: "🟢", medium: "🟡", high: "🔴" }[outlook.riskLevel] || "🟡";

  return (
    <div className="hiring-outlook-card">
      <div className="hoc-header">
        <span className="hoc-title">🎯 Hiring Prediction</span>
        <span className="hoc-badge" style={{ color, background: `${color}18`, border: `1px solid ${color}33` }}>{label}</span>
      </div>
      <div className="hoc-body">
        <div className="hoc-metrics">
          <div className="hoc-metric">
            <span className="hoc-metric-label">Shortlist probability</span>
            <div className="hoc-track"><div className="hoc-fill" style={{ width: `${pct}%`, background: color }}/></div>
            <span className="hoc-val" style={{ color }}>{pct}%</span>
          </div>
          {iConv > 0 && (
            <div className="hoc-metric">
              <span className="hoc-metric-label">Interview pass rate (if shortlisted)</span>
              <div className="hoc-track"><div className="hoc-fill" style={{ width: `${iConv}%`, background: "#6366f1" }}/></div>
              <span className="hoc-val" style={{ color: "#818cf8" }}>{iConv}%</span>
            </div>
          )}
        </div>
        <div className="hoc-meta">
          {outlook.riskLevel && (
            <div className="hoc-risk">
              <span>{riskEmoji} Risk level:</span>
              <span style={{ color: { low:"#10b981", medium:"#f59e0b", high:"#f43f5e" }[outlook.riskLevel] || "#f59e0b", fontWeight: 600, textTransform: "capitalize" }}>
                {outlook.riskLevel}
              </span>
            </div>
          )}
        </div>
        {outlook.verdict && <p className="hoc-verdict">{outlook.verdict}</p>}
        {outlook.rejectionReasons?.length > 0 && (
          <div className="hoc-reasons">
            <span className="hoc-reasons-label">🚫 Top rejection risks</span>
            {outlook.rejectionReasons.map((r, i) => (
              <div className="hoc-reason" key={i}><XIcon/>{r}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Hiring Diagnosis ─────────────────────────────────────────────────────────
function HiringDiagnosisCard({ diagnosis }) {
  if (!diagnosis || (!diagnosis.primaryConcern && !diagnosis.strengths?.length)) return null;
  return (
    <div className="hiring-diag-card">
      <div className="hd-header"><AlertIcon/><span>Hiring Diagnosis</span></div>
      <div className="hd-body">
        {diagnosis.primaryConcern && (
          <div className="hd-primary">
            <span className="hd-label hd-label--red">🔴 Primary hiring blocker</span>
            <p>{diagnosis.primaryConcern}</p>
          </div>
        )}
        {diagnosis.secondaryGaps?.length > 0 && (
          <div className="hd-group">
            <span className="hd-label hd-label--amber">🟡 Secondary concerns</span>
            {diagnosis.secondaryGaps.map((g, i) => <div className="hd-item" key={i}><XIcon/>{g}</div>)}
          </div>
        )}
        {diagnosis.strengths?.length > 0 && (
          <div className="hd-group">
            <span className="hd-label hd-label--green">🟢 What works in your favour</span>
            {diagnosis.strengths.map((s, i) => <div className="hd-item hd-item--good" key={i}><CheckIcon/>{s}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Skill Gap Intelligence ───────────────────────────────────────────────────
function SkillGapIntelligenceCard({ gaps }) {
  if (!gaps?.length) return null;
  const [open, setOpen] = useState(null);
  const impactLabel = { high: "🔴 Critical", medium: "🟡 Important", low: "🟢 Optional" };
  return (
    <div className="sgi-card">
      <div className="sgi-header">
        <AlertIcon/>
        <span>Skill Gap Intelligence</span>
        <span className="sgi-sub">Click a gap to see root cause, hiring impact, and fix plan</span>
      </div>
      <div className="sgi-list">
        {gaps.map((g, i) => (
          <div className={`sgi-item ${open === i ? "open" : ""}`} key={i}>
            <button className="sgi-item-header" onClick={() => setOpen(open === i ? null : i)}>
              <span className="sgi-skill">{g.skill}</span>
              <span className="sgi-impact" style={{ color: impactColor(g.impact), background: `${impactColor(g.impact)}18` }}>
                {impactLabel[g.impact] || "🟡 Important"}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: open === i ? "rotate(180deg)" : "none", transition: "transform 0.2s", color: "#44445a", flexShrink: 0 }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {open === i && (
              <div className="sgi-item-body">
                {g.whyMissing && (
                  <div className="sgi-field">
                    <span className="sgi-field-label">Why it's absent from your resume</span>
                    <p>{g.whyMissing}</p>
                  </div>
                )}
                {g.hiringEffect && (
                  <div className="sgi-field sgi-field--effect">
                    <span className="sgi-field-label">Impact on hiring decision</span>
                    <p>{g.hiringEffect}</p>
                  </div>
                )}
                {g.fixPlan?.length > 0 && (
                  <div className="sgi-field">
                    <span className="sgi-field-label">How to fix this</span>
                    <ul className="sgi-fix-list">
                      {g.fixPlan.map((step, j) => <li key={j}><CheckIcon/>{step}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Action Plan ─────────────────────────────────────────────────────────────
function ActionPlanCard({ plan }) {
  if (!plan || (!plan.mustFix?.length && !plan.nextPriority?.length && !plan.optional?.length)) return null;
  const sections = [
    { label: "🔴 Must fix first — highest hiring impact", items: plan.mustFix,      cls: "red"   },
    { label: "🟡 Next priority",                          items: plan.nextPriority, cls: "amber" },
    { label: "🟢 Optional improvements",                  items: plan.optional,     cls: "green" },
  ];
  return (
    <div className="action-plan-card">
      <div className="ap-header"><LightbulbIcon/> Prioritised Action Plan</div>
      <div className="ap-body">
        {sections.map((sec) => sec.items?.length > 0 ? (
          <div className={`ap-section ap-section--${sec.cls}`} key={sec.label}>
            <span className="ap-section-label">{sec.label}</span>
            {sec.items.map((item, i) => (
              <div className="ap-item" key={i}><div className="ap-dot"/><span>{item}</span></div>
            ))}
          </div>
        ) : null)}
      </div>
    </div>
  );
}

// ─── Ranked Suggestions ───────────────────────────────────────────────────────
function RankedSuggestionsCard({ suggestions }) {
  if (!suggestions?.length) return null;
  const byImpact = { high: [], medium: [], low: [] };
  suggestions.forEach((s) => (byImpact[s.impact] || byImpact.medium).push(s.text));
  const sections = [
    { key: "high",   label: "🔴 High impact — do these first",  color: "#f43f5e" },
    { key: "medium", label: "🟡 Medium impact",                  color: "#f59e0b" },
    { key: "low",    label: "🟢 Low impact",                     color: "#6d6d8a" },
  ];
  return (
    <div className="ranked-suggestions-card">
      <div className="rsc-header"><LightbulbIcon/> Ranked Improvements</div>
      {sections.map((sec) => byImpact[sec.key].length > 0 ? (
        <div className="rsc-group" key={sec.key}>
          <div className="rsc-group-label" style={{ color: sec.color }}>{sec.label}</div>
          {byImpact[sec.key].map((text, i) => (
            <div className="rsc-item" key={i}>
              <div className="rsc-dot" style={{ background: sec.color }}/>
              <span>{text}</span>
            </div>
          ))}
        </div>
      ) : null)}
    </div>
  );
}

// ─── Results ──────────────────────────────────────────────────────────────────
function Results({ data, jobRole, onClear }) {
  const [bullet,      setBullet]      = useState("");
  const [rewriting,   setRewriting]   = useState(false);
  const [rewritten,   setRewritten]   = useState("");
  const [explanation, setExplanation] = useState("");
  const [copied,      setCopied]      = useState(false);
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

  return (
    <div className="results-section">

      {/* Score Hero */}
      <div className="score-hero">
        <ScoreRing score={data.score}/>
        <div className="score-breakdown">
          <div className="breakdown-header">
            <div className="breakdown-title">Match Breakdown</div>
            <div className="breakdown-sub">vs. job description</div>
          </div>
          {data.breakdown.map((b) => (
            <div className="breakdown-bar-row" key={b.label}>
              <span className="bar-label">{b.label}</span>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${b.pct}%`, background: barColor(b.pct) }}/></div>
              <span className="bar-pct">{b.pct}%</span>
            </div>
          ))}
          <div className="score-hero-actions">
            <button className="pdf-btn" onClick={handleDownloadPdf} disabled={downloading}>
              <DownloadIcon/> {downloading ? "Generating PDF…" : "Download Optimized Resume"}
            </button>
            <button className="clear-btn" onClick={onClear}><TrashIcon/> New Analysis</button>
          </div>
        </div>
      </div>

      {/* Hiring Outlook */}
      <HiringOutlookCard outlook={data.hiringOutlook}/>

      {/* Hiring Diagnosis */}
      <HiringDiagnosisCard diagnosis={data.hiringDiagnosis}/>

      {/* Score Breakdown — fixed, no longer shows 0s */}
      <ScoreBreakdownCard breakdown={data.scoreBreakdown}/>

      {/* Three-col cards */}
      <div className="results-grid">
        <div className="result-card">
          <div className="rc-header">
            <div className="rc-icon" style={{ background: "rgba(244,63,94,0.1)", color: "#f43f5e" }}><XIcon/></div>
            <span className="rc-title">Missing Skills</span>
            <span className="rc-count">{data.missingSkills.length}</span>
          </div>
          <div className="tag-list">
            {data.missingSkills.length > 0
              ? data.missingSkills.map((s) => <span className="tag tag--missing" key={s}>{s}</span>)
              : <span className="tag-empty">None detected ✓</span>}
          </div>
        </div>
        <div className="result-card">
          <div className="rc-header">
            <div className="rc-icon" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}><AlertIcon/></div>
            <span className="rc-title">Skill Gaps</span>
            <span className="rc-count">{data.skillGaps.length}</span>
          </div>
          <div className="gap-list">
            {data.skillGaps.length > 0
              ? data.skillGaps.map((g) => (
                <div className="gap-item" key={g.skill}>
                  <span className="gap-skill">{g.skill}</span>
                  <span className="gap-severity" style={{ color: severityFg(g.severity), background: severityBg(g.severity) }}>{g.severity}</span>
                </div>
              ))
              : <span className="tag-empty">No critical gaps ✓</span>}
          </div>
        </div>
        <div className="result-card">
          <div className="rc-header">
            <div className="rc-icon" style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8" }}><LightbulbIcon/></div>
            <span className="rc-title">AI Suggestions</span>
            <span className="rc-count">{data.suggestions.length}</span>
          </div>
          <div className="suggestion-list">
            {data.suggestions.map((s, i) => (
              <div className="suggestion-item" key={i}>
                <div className={`s-dot s-dot--${["blue","green","amber","violet","green"][i % 5]}`}/>
                <span className="s-text">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ATS Issues */}
      {data.atsIssues.length > 0 && (
        <div className="ats-card">
          <div className="ats-icon"><AlertIcon/></div>
          <div className="ats-content">
            <div className="ats-title">ATS Compatibility Issues</div>
            <div className="tag-list" style={{ marginTop: "0.5rem" }}>
              {data.atsIssues.map((issue, i) => <span className="tag tag--warning" key={i}>{issue}</span>)}
            </div>
          </div>
        </div>
      )}

      {/* Skill Gap Intelligence */}
      <SkillGapIntelligenceCard gaps={data.skillGapIntelligence}/>

      {/* Ranked Suggestions */}
      <RankedSuggestionsCard suggestions={data.rankedSuggestions}/>

      {/* Action Plan */}
      <ActionPlanCard plan={data.actionPlan}/>

      {/* Bullet Rewrites */}
      {data.bulletRewrites.length > 0 && (
        <div className="rewrites-panel">
          <div className="rewrites-header"><WandIcon/> AI-Generated Bullet Rewrites<span className="ai-badge"><div className="ai-dot"/> Gemini</span></div>
          <div className="rewrites-list">
            {data.bulletRewrites.map((r, i) => (
              <div className="rewrite-item-block" key={i}>
                <div className="rewrite-before"><span className="rewrite-label before">Before</span>{r.original}</div>
                <div className="rewrite-after"><span className="rewrite-label after">After</span>{r.improved}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Good / Weak parts */}
      {(data.goodParts.length > 0 || data.weakParts.length > 0) && (
        <div className="parts-grid">
          {data.goodParts.length > 0 && (
            <div className="parts-col parts-col--good">
              <div className="parts-col-title"><CheckIcon/> Strong Sections</div>
              {data.goodParts.map((p, i) => <div className="parts-item" key={i}>{p}</div>)}
            </div>
          )}
          {data.weakParts.length > 0 && (
            <div className="parts-col parts-col--weak">
              <div className="parts-col-title"><XIcon/> Needs Improvement</div>
              {data.weakParts.map((p, i) => <div className="parts-item" key={i}>{p}</div>)}
            </div>
          )}
        </div>
      )}

      {/* Manual Bullet Rewriter */}
      <div className="rewrite-panel">
        <div className="rewrite-header">
          <div className="rw-title"><WandIcon/> AI Bullet Point Rewriter</div>
          <span className="ai-badge"><div className="ai-dot"/> AI Powered</span>
        </div>
        <div className="rewrite-body">
          <div className="bullet-input-row">
            <textarea placeholder='Paste a weak bullet — e.g. "Worked on backend features and fixed bugs"'
              value={bullet} onChange={(e) => setBullet(e.target.value)}/>
            <button className="rewrite-btn" onClick={handleRewrite} disabled={rewriting || !bullet.trim()}>
              {rewriting ? "Rewriting…" : "✦ Improve"}
            </button>
          </div>
          {(rewritten || rewriting) && (
            <div className="rewrite-output">
              {rewriting
                ? <span className="rewriting-msg">Rewriting your bullet point…</span>
                : <>
                    <span className="rewrite-result">{rewritten}</span>
                    {explanation && <p className="rewrite-explanation">{explanation}</p>}
                    <button className={`copy-btn ${copied ? "copied" : ""}`}
                      onClick={() => { navigator.clipboard.writeText(rewritten); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                      {copied ? "✓ Copied" : <><CopyIcon/> Copy</>}
                    </button>
                  </>}
            </div>
          )}
        </div>
      </div>

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
      <div className="az-orb az-orb-1"/><div className="az-orb az-orb-2"/>
      <Sidebar/>
      <div className="analyzer-main">
        <header className="analyzer-topbar">
          <div className="topbar-left">
            <div className="topbar-title">Resume Analyzer</div>
            <div className="topbar-sub">AI-powered matching & optimization</div>
          </div>
          <div className="topbar-actions">
            <div className="status-pill"><div className="dot"/> AI Online</div>
          </div>
        </header>
        <main className="analyzer-body">
          {!result && (
            <>
              <div className="section-heading"><span className="sh-label">Input</span></div>
              <div className="input-panels">
                <UploadPanel file={file} onFile={setFile}/>
                <JDPanel jd={jd} setJd={setJd} role={role} setRole={setRole}/>
              </div>
              <div className="analyze-btn-row">
                <button className={`analyze-btn ${loading ? "loading" : ""}`}
                  onClick={handleAnalyze} disabled={loading || !canAnalyze}>
                  {loading ? <><div className="spinner"/> Analyzing with Gemini AI…</> : <><SparklesIcon/> Analyze Resume</>}
                </button>
                {!canAnalyze && <p className="analyze-hint">Upload a PDF resume and paste a job description to begin</p>}
              </div>
              {error && <p className="error-msg">{error}</p>}
              {canAnalyze && !loading && (
                <div className="empty-state">
                  <div className="empty-icon"><BrainIcon/></div>
                  <p>Click "Analyze Resume" to get your AI-powered match score, skill gaps, and improvement tips.</p>
                </div>
              )}
            </>
          )}
          {result && (
            <>
              <div className="section-heading"><span className="sh-label">Results</span></div>
              <Results data={result} jobRole={role} onClear={handleClear}/>
            </>
          )}
        </main>
      </div>
    </div>
  );
}