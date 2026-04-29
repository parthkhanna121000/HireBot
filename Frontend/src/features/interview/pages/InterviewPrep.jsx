import React, { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router";
import Sidebar from "../../shared/Sidebar";
import { generateReport, fetchReportById, downloadReportPdf } from "../services/interview.api";
import "../styles/interview.scss";

const STORAGE_KEY = "hirebot_interview_result";

// ─── Icons ────────────────────────────────────────────────────────────────────
const UploadIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const SparklesIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z"/></svg>;
const ChevronIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
const CodeIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
const HeartIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
const CalendarIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const AlertIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const DownloadIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const FileIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const TrashIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;
const CheckIcon    = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const ClockIcon    = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const BackIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ringColor  = (s) => s >= 80 ? "#10b981" : s >= 65 ? "#6366f1" : s >= 50 ? "#f59e0b" : "#f43f5e";
const severityFg = (s) => ({ high: "#f43f5e", medium: "#f59e0b", low: "#a5b4fc" }[s] || "#a5b4fc");
const severityBg = (s) => ({ high: "rgba(244,63,94,0.12)", medium: "rgba(245,158,11,0.12)", low: "rgba(99,102,241,0.12)" }[s] || "rgba(99,102,241,0.12)");

const DIFF = {
  Easy:   { color: "#10b981", bg: "rgba(16,185,129,0.1)"  },
  Medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  Hard:   { color: "#f43f5e", bg: "rgba(244,63,94,0.1)"   },
};

const dayTime = (n) => n <= 2 ? "1–2 hrs" : n <= 4 ? "2–3 hrs" : "3–4 hrs";

// ─── Match Ring ───────────────────────────────────────────────────────────────
function MatchRing({ score, title }) {
  const r = 54, circ = 2 * Math.PI * r, fill = (score / 100) * circ, color = ringColor(score);
  return (
    <div className="iv-ring-wrap">
      <svg width="148" height="148" viewBox="0 0 148 148">
        <circle cx="74" cy="74" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10"/>
        <circle cx="74" cy="74" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`} transform="rotate(-90 74 74)"
          style={{ transition:"stroke-dasharray 1.4s cubic-bezier(0.22,1,0.36,1)", filter:`drop-shadow(0 0 14px ${color}88)` }}/>
      </svg>
      <div className="iv-ring-inner">
        <span className="iv-ring-num">{score}</span>
        <span className="iv-ring-label">/ 100</span>
      </div>
      {title && <p className="iv-ring-title">{title}</p>}
    </div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────
function QuestionCard({ q, index }) {
  const [open, setOpen] = useState(false);
  const ds          = DIFF[q.difficulty] || DIFF.Medium;
  const hasAnswer   = q.answer   && q.answer.trim().length > 10;
  const hasIntent   = q.intention && q.intention.trim().length > 5;
  const hasPoints   = Array.isArray(q.keyPoints) && q.keyPoints.length > 0;

  return (
    <div className={`iv-q-card ${open ? "iv-q-card--open" : ""}`}>
      <button className="iv-q-trigger" onClick={() => setOpen(o => !o)}>
        <div className="iv-q-num">{index + 1}</div>
        <div className="iv-q-trigger-body">
          <p className="iv-q-text">{q.question}</p>
          <div className="iv-q-badges">
            {q.difficulty && (
              <span className="iv-q-diff" style={{ color: ds.color, background: ds.bg }}>
                {q.difficulty}
              </span>
            )}
            {hasAnswer && <span className="iv-q-avail">Model answer ✓</span>}
          </div>
        </div>
        <span className={`iv-q-arrow ${open ? "iv-q-arrow--open" : ""}`}><ChevronIcon/></span>
      </button>

      {open && (
        <div className="iv-q-drawer">
          {/* Why section */}
          <div className="iv-q-section iv-q-why">
            <span className="iv-q-sec-label">Why interviewers ask this</span>
            <p>{hasIntent ? q.intention : "Tests your understanding of this concept and your ability to explain it clearly and concisely under interview pressure."}</p>
          </div>

          {/* Answer section */}
          <div className="iv-q-section iv-q-ans">
            <span className="iv-q-sec-label">Model answer</span>
            {hasAnswer ? (
              <div className="iv-q-ans-body">{q.answer}</div>
            ) : (
              <div className="iv-q-ans-missing">
                <p>Answer not generated for this question.</p>
                <p className="iv-q-star">
                  Structure your answer: <strong>Situation → Task → Action → Result</strong> — draw from a real project you have worked on.
                </p>
              </div>
            )}
          </div>

          {/* Key points */}
          {hasPoints && (
            <div className="iv-q-section iv-q-points">
              <span className="iv-q-sec-label">Key points to cover</span>
              <ul>
                {q.keyPoints.map((pt, i) => (
                  <li key={i}><CheckIcon/><span>{pt}</span></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Prep Day Card ────────────────────────────────────────────────────────────
function PrepDayCard({ day, dayIndex, total, done, onToggle }) {
  const [open, setOpen] = useState(dayIndex < 2);
  const tasks      = Array.isArray(day.tasks) ? day.tasks : [];
  const doneCount  = tasks.filter((_, ti) => done[`${dayIndex}-${ti}`]).length;
  const progress   = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;
  const complete   = tasks.length > 0 && progress === 100;

  return (
    <div className={`iv-day ${complete ? "iv-day--done" : ""}`}>
      {dayIndex < total - 1 && <div className="iv-day-line"/>}

      <div className={`iv-day-badge ${complete ? "iv-day-badge--done" : ""}`}>
        {complete ? <CheckIcon/> : <span>{day.day}</span>}
      </div>

      <div className="iv-day-card">
        <button className="iv-day-header" onClick={() => setOpen(o => !o)}>
          <div className="iv-day-info">
            <span className="iv-day-tag">Day {day.day}</span>
            <span className="iv-day-focus">{day.focus}</span>
            <div className="iv-day-meta">
              <span><ClockIcon/> {dayTime(tasks.length)}</span>
              <span>{tasks.length} tasks</span>
              {doneCount > 0 && <span style={{ color:"#10b981" }}>{doneCount}/{tasks.length} done</span>}
            </div>
          </div>

          {/* Progress ring */}
          <div className="iv-day-ring">
            <svg width="40" height="40" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3"/>
              <circle cx="20" cy="20" r="15" fill="none"
                stroke={complete ? "#10b981" : "#6366f1"}
                strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${(progress/100)*94.2} 94.2`}
                transform="rotate(-90 20 20)"
                style={{ transition:"stroke-dasharray 0.4s" }}/>
            </svg>
            <span className="iv-day-pct">{progress}%</span>
          </div>

          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ transform:open?"rotate(180deg)":"none", transition:"transform 0.2s", color:"#44445a", flexShrink:0 }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {open && (
          <div className="iv-day-tasks">
            {tasks.length > 0 ? tasks.map((task, ti) => {
              const key = `${dayIndex}-${ti}`;
              const isDone = !!done[key];
              return (
                <label key={ti} className={`iv-task ${isDone ? "iv-task--done" : ""}`}>
                  <div className={`iv-task-box ${isDone ? "iv-task-box--checked" : ""}`}
                    onClick={() => onToggle(key)}>
                    {isDone && <CheckIcon/>}
                  </div>
                  <span>{task}</span>
                </label>
              );
            }) : (
              <p className="iv-day-empty">Tasks are being generated — try regenerating the report if this persists.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Report View ──────────────────────────────────────────────────────────────
function ReportView({ report, reportId, onClear, isHistorical }) {
  const [tab,         setTab]         = useState("technical");
  const [downloading, setDownloading] = useState(false);
  const [done,        setDone]        = useState({});

  const techQ  = report.technicalQuestions  || [];
  const behavQ = report.behavioralQuestions || [];
  const gaps   = report.skillGaps           || [];
  const plan   = report.preparationPlan     || [];

  const totalTasks = plan.reduce((a, d) => a + (d.tasks?.length || 0), 0);
  const doneCt     = Object.values(done).filter(Boolean).length;
  const planPct    = totalTasks > 0 ? Math.round((doneCt / totalTasks) * 100) : 0;

  const toggle = (key) => setDone(p => ({ ...p, [key]: !p[key] }));

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await downloadReportPdf(reportId);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a"); a.href = url; a.download = "resume.pdf"; a.click();
      URL.revokeObjectURL(url);
    } catch { alert("PDF generation failed. Please try again."); }
    finally { setDownloading(false); }
  };

  const TABS = [
    { id:"technical",  icon:<CodeIcon/>,     label:"Technical",  count:techQ.length  },
    { id:"behavioral", icon:<HeartIcon/>,    label:"Behavioral", count:behavQ.length },
    { id:"gaps",       icon:<AlertIcon/>,    label:"Skill Gaps", count:gaps.length   },
    { id:"plan",       icon:<CalendarIcon/>, label:"Prep Plan",  count:plan.length   },
  ];

  return (
    <div className="iv-report">
      {/* Hero */}
      <div className="iv-hero">
        <MatchRing score={report.matchScore || 0} title={report.title}/>
        <div className="iv-stats">
          {[{n:techQ.length,l:"Technical Qs"},{n:behavQ.length,l:"Behavioral Qs"},{n:gaps.length,l:"Skill Gaps"},{n:plan.length,l:"Day Plan"}]
            .map(s => (
              <div className="iv-stat" key={s.l}>
                <div className="iv-stat-n">{s.n}</div>
                <div className="iv-stat-l">{s.l}</div>
              </div>
            ))}
        </div>
        <div className="iv-hero-btns">
          <button className="iv-btn-pdf" onClick={handleDownload} disabled={downloading}>
            <DownloadIcon/> {downloading ? "Generating…" : "Download Resume PDF"}
          </button>
          <button className="iv-btn-clear" onClick={onClear}>
            <TrashIcon/> {isHistorical ? "← Back" : "New Report"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="iv-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`iv-tab ${tab===t.id?"iv-tab--active":""}`} onClick={()=>setTab(t.id)}>
            {t.icon}<span>{t.label}</span><span className="iv-tab-ct">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Technical */}
      {tab === "technical" && (
        <div className="iv-panel">
          <div className="iv-panel-hdr">
            <div className="iv-panel-icon" style={{background:"rgba(99,102,241,0.12)",color:"#818cf8"}}><CodeIcon/></div>
            <div>
              <div className="iv-panel-title">Technical Questions</div>
              <div className="iv-panel-sub">{techQ.length} questions — click any question to expand model answer</div>
            </div>
          </div>
          {techQ.length > 0
            ? <div className="iv-q-list">{techQ.map((q,i) => <QuestionCard key={i} q={q} index={i}/>)}</div>
            : <div className="iv-empty">No technical questions generated.</div>}
        </div>
      )}

      {/* Behavioral */}
      {tab === "behavioral" && (
        <div className="iv-panel">
          <div className="iv-panel-hdr">
            <div className="iv-panel-icon" style={{background:"rgba(16,185,129,0.12)",color:"#10b981"}}><HeartIcon/></div>
            <div>
              <div className="iv-panel-title">Behavioral Questions</div>
              <div className="iv-panel-sub">{behavQ.length} questions with STAR answers — click to expand</div>
            </div>
          </div>
          {behavQ.length > 0
            ? <div className="iv-q-list">{behavQ.map((q,i) => <QuestionCard key={i} q={q} index={i}/>)}</div>
            : <div className="iv-empty">No behavioral questions generated.</div>}
        </div>
      )}

      {/* Skill Gaps */}
      {tab === "gaps" && (
        <div className="iv-panel">
          <div className="iv-panel-hdr">
            <div className="iv-panel-icon" style={{background:"rgba(244,63,94,0.12)",color:"#f43f5e"}}><AlertIcon/></div>
            <div>
              <div className="iv-panel-title">Skill Gaps to Address</div>
              <div className="iv-panel-sub">Focus on high severity gaps first</div>
            </div>
          </div>
          {gaps.length > 0 ? (
            <div className="iv-gaps-grid">
              {gaps.map((g,i) => (
                <div className="iv-gap-chip" key={g.skill||i}>
                  <span className="iv-gap-name">{g.skill}</span>
                  <span className="iv-gap-sev" style={{color:severityFg(g.severity),background:severityBg(g.severity)}}>{g.severity}</span>
                </div>
              ))}
            </div>
          ) : <div className="iv-empty">No significant skill gaps — strong match!</div>}
        </div>
      )}

      {/* Prep Plan */}
      {tab === "plan" && (
        <div className="iv-panel">
          <div className="iv-panel-hdr">
            <div className="iv-panel-icon" style={{background:"rgba(245,158,11,0.12)",color:"#f59e0b"}}><CalendarIcon/></div>
            <div>
              <div className="iv-panel-title">Day-by-Day Preparation Plan</div>
              <div className="iv-panel-sub">
                {plan.length}-day guide · {totalTasks} tasks
                {doneCt > 0 && <span style={{color:"#10b981",marginLeft:8}}>· {doneCt} completed ✓</span>}
              </div>
            </div>
          </div>

          {totalTasks > 0 && (
            <div className="iv-plan-bar">
              <div className="iv-plan-track"><div className="iv-plan-fill" style={{width:`${planPct}%`}}/></div>
              <span className="iv-plan-pct">{planPct}%</span>
            </div>
          )}

          {plan.length > 0 ? (
            <div className="iv-timeline">
              {plan.map((day, i) => (
                <PrepDayCard key={day.day||i} day={day} dayIndex={i} total={plan.length} done={done} onToggle={toggle}/>
              ))}
            </div>
          ) : <div className="iv-empty">No preparation plan generated. Try regenerating.</div>}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InterviewPrep() {
  const [searchParams] = useSearchParams();
  const reportIdParam  = searchParams.get("reportId");

  const [file,        setFile]        = useState(null);
  const [jd,          setJd]          = useState("");
  const [selfDesc,    setSelfDesc]    = useState("");
  const [title,       setTitle]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [loadingHist, setLoadingHist] = useState(false);
  const [report,      setReport]      = useState(null);
  const [reportId,    setReportId]    = useState(null);
  const [isHistorical,setIsHistorical]= useState(false);
  const [error,       setError]       = useState("");
  const fileRef = useRef();

  // ── Load from URL param (from InterviewHistory "View" button) ──────────────
  useEffect(() => {
    if (reportIdParam) {
      setLoadingHist(true);
      fetchReportById(reportIdParam)
        .then(res => {
          if (res.success && res.data) {
            setReport(res.data);
            setReportId(res.data._id);
            setIsHistorical(true);
          } else {
            setError("Could not load this report.");
          }
        })
        .catch(() => setError("Failed to load report."))
        .finally(() => setLoadingHist(false));
    }
  }, [reportIdParam]);

  // ── Persist/restore from sessionStorage (for current session) ─────────────
  useEffect(() => {
    if (!reportIdParam) {
      try {
        const s = sessionStorage.getItem(STORAGE_KEY);
        if (s) { const p = JSON.parse(s); setReport(p.report); setReportId(p.reportId); }
      } catch { sessionStorage.removeItem(STORAGE_KEY); }
    }
  }, []);

  useEffect(() => {
    if (report && reportId && !isHistorical) {
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ report, reportId })); }
      catch {}
    }
  }, [report, reportId, isHistorical]);

  const canGen = jd.trim().length > 20 && title.trim().length > 0;

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") setFile(f);
  }, []);

  const handleGenerate = async () => {
    setLoading(true); setError(""); setReport(null); setIsHistorical(false);
    sessionStorage.removeItem(STORAGE_KEY);
    try {
      const res = await generateReport({ file, jobDescription: jd, selfDescription: selfDesc, title });
      if (res.success) { setReport(res.data); setReportId(res.data._id); }
      else setError(res.message || "Report generation failed.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate report. Please try again.");
    } finally { setLoading(false); }
  };

  const handleClear = () => {
    setReport(null); setReportId(null); setFile(null); setIsHistorical(false);
    setJd(""); setSelfDesc(""); setTitle(""); setError("");
    sessionStorage.removeItem(STORAGE_KEY);
    if (reportIdParam) window.history.pushState({}, "", "/interview-prep");
  };

  return (
    <div className="iv-layout">
      <div className="iv-orb iv-orb-1"/><div className="iv-orb iv-orb-2"/>
      <Sidebar/>
      <div className="iv-main">
        <header className="iv-topbar">
          <div>
            <div className="iv-topbar-title">Interview Prep</div>
            <div className="iv-topbar-sub">AI-generated questions with full answers, skill gaps & study plan</div>
          </div>
          <div className="iv-status-pill"><div className="iv-dot"/> Gemini AI</div>
        </header>

        <main className="iv-body">
          {loadingHist && <div className="iv-page-loading">Loading report…</div>}

          {!report && !loadingHist && (
            <>
              <div className="iv-section-label">Configure Your Session</div>
              <div className="iv-form">
                <div className="iv-field">
                  <label className="iv-label">Job Title <span className="req">*</span></label>
                  <input className="iv-input" type="text"
                    placeholder="e.g. Software Development Intern at Google"
                    value={title} onChange={e => setTitle(e.target.value)}/>
                </div>

                <div className="iv-form-2col">
                  <div className="iv-field">
                    <label className="iv-label">Job Description <span className="req">*</span></label>
                    <textarea className="iv-textarea" rows={7}
                      placeholder="Paste the full job description — requirements, responsibilities, tech stack…"
                      value={jd} onChange={e => setJd(e.target.value)}/>
                  </div>
                  <div className="iv-field">
                    <label className="iv-label">About Yourself</label>
                    <textarea className="iv-textarea" rows={7}
                      placeholder="Brief summary of your background, experience, and strengths… (optional but improves personalisation)"
                      value={selfDesc} onChange={e => setSelfDesc(e.target.value)}/>
                  </div>
                </div>

                <div className="iv-field">
                  <label className="iv-label">Resume PDF <span className="opt">(optional — improves accuracy)</span></label>
                  <div className={`iv-drop ${file?"iv-drop--has":""}`}
                    onDragOver={e=>e.preventDefault()} onDrop={handleDrop}
                    onClick={()=>!file&&fileRef.current.click()}>
                    {file ? (
                      <div className="iv-drop-file">
                        <FileIcon/><span>{file.name}</span>
                        <span className="iv-drop-size">{(file.size/1024).toFixed(1)} KB</span>
                        <button className="iv-drop-rm" onClick={e=>{e.stopPropagation();setFile(null);}}>Remove</button>
                      </div>
                    ) : (
                      <div className="iv-drop-prompt"><UploadIcon/><span>Drop PDF or <strong>click to browse</strong></span></div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept=".pdf" style={{display:"none"}}
                    onChange={e=>setFile(e.target.files[0]||null)}/>
                </div>

                <div className="iv-gen-row">
                  <button className={`iv-gen-btn ${loading?"loading":""}`}
                    onClick={handleGenerate} disabled={loading||!canGen}>
                    {loading
                      ? <><div className="iv-spinner"/> Generating with Gemini AI…</>
                      : <><SparklesIcon/> Generate Interview Report</>}
                  </button>
                  {!canGen && <p className="iv-hint">Enter a job title and description to begin</p>}
                </div>

                {loading && (
                  <div className="iv-loading-card">
                    {["Analysing your profile against the JD",
                      "Generating technical questions with full model answers",
                      "Building behavioral Q&A with STAR responses",
                      "Creating your personalised day-by-day prep plan",
                    ].map((s,i) => (
                      <div key={i} className="iv-loading-step" style={{animationDelay:`${i*0.45}s`}}>
                        <div className="iv-loading-dot"/>{s}
                      </div>
                    ))}
                    <p className="iv-loading-note">Takes 30–60 sec — answer generation runs in 2 steps for completeness</p>
                  </div>
                )}

                {error && <p className="iv-error">{error}</p>}
              </div>
            </>
          )}

          {report && !loadingHist && (
            <>
              <div className="iv-section-label">
                {isHistorical ? "Viewing Saved Report" : "Your Report"}
              </div>
              <ReportView report={report} reportId={reportId} onClear={handleClear} isHistorical={isHistorical}/>
            </>
          )}
        </main>
      </div>
    </div>
  );
}