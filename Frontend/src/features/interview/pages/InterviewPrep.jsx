import React, { useState, useRef, useCallback, useEffect, useId } from "react";
import { useSearchParams } from "react-router";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
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
const CheckIcon    = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const ClockIcon    = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const BackIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const PlusIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;

// ─── Motion presets ───────────────────────────────────────────────────────────
const EASE = [0.2, 0.7, 0.2, 1];
const rise = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};
const stagger = (s = 0.06, d = 0) => ({
  hidden: {},
  show:   { transition: { staggerChildren: s, delayChildren: d } },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ringBand = (s) => (s >= 80 ? "great" : s >= 65 ? "good" : s >= 50 ? "mid" : "low");
const sevKey   = (s) => (["high", "medium", "low"].includes(s) ? s : "low");
const diffKey  = (d) => (["Easy", "Medium", "Hard"].includes(d) ? d.toLowerCase() : "medium");
const dayTime  = (n) => (n <= 2 ? "1–2 hrs" : n <= 4 ? "2–3 hrs" : "3–4 hrs");

function useCountUp(target, duration = 1000) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (typeof target !== "number" || Number.isNaN(target)) return;
    if (reduce) { setV(target); return; }
    let raf, start;
    const tick = (t) => {
      start = start ?? t;
      const p = Math.min((t - start) / duration, 1);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reduce]);
  return v;
}

function Collapse({ open, id, children }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          id={id}
          className="iv-collapse"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Match Ring ───────────────────────────────────────────────────────────────
function MatchRing({ score, title }) {
  const reduce = useReducedMotion();
  const value  = Math.max(0, Math.min(100, Number(score) || 0));
  const r = 54, circ = 2 * Math.PI * r;
  const n = useCountUp(value, 1300);
  return (
    <div className={`iv-ring iv-ring--${ringBand(value)}`}>
      <div className="iv-ring__dial">
        <svg viewBox="0 0 148 148" aria-hidden="true">
          <circle className="iv-ring__track" cx="74" cy="74" r={r} />
          <motion.circle
            className="iv-ring__value" cx="74" cy="74" r={r}
            strokeDasharray={circ}
            initial={{ strokeDashoffset: reduce ? circ * (1 - value / 100) : circ }}
            animate={{ strokeDashoffset: circ * (1 - value / 100) }}
            transition={{ duration: reduce ? 0 : 1.4, ease: EASE, delay: 0.2 }}
          />
        </svg>
        <div className="iv-ring__inner">
          <span className="iv-ring__num">{n}</span>
          <span className="iv-ring__of">/ 100</span>
        </div>
      </div>
      {title && <p className="iv-ring__title">{title}</p>}
    </div>
  );
}

function Stat({ n, l }) {
  const v = useCountUp(n, 900);
  return (
    <div className="iv-stat">
      <div className="iv-stat-n">{v}</div>
      <div className="iv-stat-l">{l}</div>
    </div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────
function QuestionCard({ q, index }) {
  const [open, setOpen] = useState(false);
  const drawerId  = useId();
  const hasAnswer = q.answer && q.answer.trim().length > 10;
  const hasIntent = q.intention && q.intention.trim().length > 5;
  const hasPoints = Array.isArray(q.keyPoints) && q.keyPoints.length > 0;

  return (
    <div className={`iv-q-card ${open ? "iv-q-card--open" : ""}`}>
      <button
        type="button"
        className="iv-q-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={drawerId}
      >
        <div className="iv-q-num">{String(index + 1).padStart(2, "0")}</div>
        <div className="iv-q-trigger-body">
          <p className="iv-q-text">{q.question}</p>
          <div className="iv-q-badges">
            {q.difficulty && (
              <span className={`iv-q-diff iv-q-diff--${diffKey(q.difficulty)}`}>{q.difficulty}</span>
            )}
            {hasAnswer && <span className="iv-q-avail">Model answer ✓</span>}
          </div>
        </div>
        <span className={`iv-q-arrow ${open ? "iv-q-arrow--open" : ""}`}><ChevronIcon /></span>
      </button>

      <Collapse open={open} id={drawerId}>
        <div className="iv-q-drawer">
          <div className="iv-q-section">
            <span className="iv-q-sec-label">Why interviewers ask this</span>
            <p className="iv-q-why">
              {hasIntent
                ? q.intention
                : "Tests your understanding of this concept and your ability to explain it clearly and concisely under interview pressure."}
            </p>
          </div>

          <div className="iv-q-section">
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

          {hasPoints && (
            <div className="iv-q-section iv-q-points">
              <span className="iv-q-sec-label">Key points to cover</span>
              <ul>
                {q.keyPoints.map((pt, i) => (
                  <li key={i}><span className="iv-q-tick"><CheckIcon /></span><span>{pt}</span></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Collapse>
    </div>
  );
}

// ─── Prep Day Card ────────────────────────────────────────────────────────────
function PrepDayCard({ day, dayIndex, total, done, onToggle }) {
  const reduce    = useReducedMotion();
  const [open, setOpen] = useState(dayIndex < 2);
  const bodyId    = useId();
  const tasks     = Array.isArray(day.tasks) ? day.tasks : [];
  const doneCount = tasks.filter((_, ti) => done[`${dayIndex}-${ti}`]).length;
  const progress  = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;
  const complete  = tasks.length > 0 && progress === 100;
  const circ      = 2 * Math.PI * 15;

  return (
    <motion.div
      className={`iv-day ${complete ? "iv-day--done" : ""}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE, delay: reduce ? 0 : Math.min(dayIndex, 6) * 0.05 }}
    >
      {dayIndex < total - 1 && <div className="iv-day-line" />}

      <div className={`iv-day-badge ${complete ? "iv-day-badge--done" : ""}`}>
        {complete ? <CheckIcon /> : <span>{day.day}</span>}
      </div>

      <div className="iv-day-card">
        <button
          type="button"
          className="iv-day-header"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={bodyId}
        >
          <div className="iv-day-info">
            <span className="iv-day-tag">Day {day.day}</span>
            <span className="iv-day-focus">{day.focus}</span>
            <div className="iv-day-meta">
              <span><ClockIcon /> {dayTime(tasks.length)}</span>
              <span>{tasks.length} tasks</span>
              {doneCount > 0 && <span className="iv-day-meta--ok">{doneCount}/{tasks.length} done</span>}
            </div>
          </div>

          <div className={`iv-day-ring ${complete ? "iv-day-ring--done" : ""}`}>
            <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
              <circle className="iv-day-ring__track" cx="20" cy="20" r="15" />
              <motion.circle
                className="iv-day-ring__value" cx="20" cy="20" r="15"
                strokeDasharray={circ}
                initial={false}
                animate={{ strokeDashoffset: circ * (1 - progress / 100) }}
                transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
              />
            </svg>
            <span className="iv-day-pct">{progress}%</span>
          </div>

          <span className={`iv-day-chevron ${open ? "iv-day-chevron--open" : ""}`}><ChevronIcon /></span>
        </button>

        <Collapse open={open} id={bodyId}>
          <div className="iv-day-tasks">
            {tasks.length > 0 ? tasks.map((task, ti) => {
              const key    = `${dayIndex}-${ti}`;
              const isDone = !!done[key];
              return (
                <button
                  type="button"
                  key={ti}
                  role="checkbox"
                  aria-checked={isDone}
                  className={`iv-task ${isDone ? "iv-task--done" : ""}`}
                  onClick={() => onToggle(key)}
                >
                  <span className={`iv-task-box ${isDone ? "iv-task-box--checked" : ""}`}>
                    {isDone && <CheckIcon />}
                  </span>
                  <span className="iv-task-text">{task}</span>
                </button>
              );
            }) : (
              <p className="iv-day-empty">Tasks are being generated — try regenerating the report if this persists.</p>
            )}
          </div>
        </Collapse>
      </div>
    </motion.div>
  );
}

// ─── Report View ──────────────────────────────────────────────────────────────
function ReportView({ report, reportId, onClear, isHistorical }) {
  const reduce = useReducedMotion();
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

  const toggle = (key) => setDone((p) => ({ ...p, [key]: !p[key] }));

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
    { id: "technical",  icon: <CodeIcon />,     label: "Technical",  count: techQ.length  },
    { id: "behavioral", icon: <HeartIcon />,    label: "Behavioral", count: behavQ.length },
    { id: "gaps",       icon: <AlertIcon />,    label: "Skill Gaps", count: gaps.length   },
    { id: "plan",       icon: <CalendarIcon />, label: "Prep Plan",  count: plan.length   },
  ];

  const heroStats = [
    { n: techQ.length,  l: "Technical Qs"  },
    { n: behavQ.length, l: "Behavioral Qs" },
    { n: gaps.length,   l: "Skill Gaps"    },
    { n: plan.length,   l: "Day Plan"      },
  ];

  return (
    <div className="iv-report">
      {/* Hero */}
      <motion.div
        className="iv-hero"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <div className="iv-hero__glow" aria-hidden="true" />
        <MatchRing score={report.matchScore || 0} title={report.title} />
        <div className="iv-hero__body">
          <span className="iv-kicker iv-kicker--light"><i />MATCH SCORE / OVERVIEW</span>
          <div className="iv-stats">
            {heroStats.map((s) => <Stat key={s.l} n={s.n} l={s.l} />)}
          </div>
        </div>
        <div className="iv-hero-btns">
          <button type="button" className="iv-btn-pdf" onClick={handleDownload} disabled={downloading}>
            <DownloadIcon /> {downloading ? "Generating…" : "Download Resume PDF"}
          </button>
          <button type="button" className="iv-btn-clear" onClick={onClear}>
            {isHistorical ? <BackIcon /> : <PlusIcon />} {isHistorical ? "Back" : "New Report"}
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="iv-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            type="button"
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`iv-tab ${tab === t.id ? "iv-tab--active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {tab === t.id && <motion.span layoutId="iv-tab-pill" className="iv-tab-pill" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
            {t.icon}<span>{t.label}</span><span className="iv-tab-ct">{t.count}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          className="iv-panel"
          initial={{ opacity: 0, y: reduce ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : -8 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          {/* Technical */}
          {tab === "technical" && (
            <>
              <div className="iv-panel-hdr">
                <div className="iv-panel-icon iv-panel-icon--blue"><CodeIcon /></div>
                <div>
                  <div className="iv-panel-title">Technical Questions</div>
                  <div className="iv-panel-sub">{techQ.length} questions — click any question to expand model answer</div>
                </div>
              </div>
              {techQ.length > 0
                ? <div className="iv-q-list">{techQ.map((q, i) => <QuestionCard key={i} q={q} index={i} />)}</div>
                : <div className="iv-empty">No technical questions generated.</div>}
            </>
          )}

          {/* Behavioral */}
          {tab === "behavioral" && (
            <>
              <div className="iv-panel-hdr">
                <div className="iv-panel-icon iv-panel-icon--ok"><HeartIcon /></div>
                <div>
                  <div className="iv-panel-title">Behavioral Questions</div>
                  <div className="iv-panel-sub">{behavQ.length} questions with STAR answers — click to expand</div>
                </div>
              </div>
              {behavQ.length > 0
                ? <div className="iv-q-list">{behavQ.map((q, i) => <QuestionCard key={i} q={q} index={i} />)}</div>
                : <div className="iv-empty">No behavioral questions generated.</div>}
            </>
          )}

          {/* Skill Gaps */}
          {tab === "gaps" && (
            <>
              <div className="iv-panel-hdr">
                <div className="iv-panel-icon iv-panel-icon--bad"><AlertIcon /></div>
                <div>
                  <div className="iv-panel-title">Skill Gaps to Address</div>
                  <div className="iv-panel-sub">Focus on high severity gaps first</div>
                </div>
              </div>
              {gaps.length > 0 ? (
                <motion.div className="iv-gaps-grid" variants={stagger(0.05)} initial="hidden" animate="show">
                  {gaps.map((g, i) => (
                    <motion.div className="iv-gap-chip" key={g.skill || i} variants={rise}>
                      <span className="iv-gap-name">{g.skill}</span>
                      <span className={`iv-gap-sev iv-gap-sev--${sevKey(g.severity)}`}>{g.severity}</span>
                    </motion.div>
                  ))}
                </motion.div>
              ) : <div className="iv-empty">No significant skill gaps — strong match!</div>}
            </>
          )}

          {/* Prep Plan */}
          {tab === "plan" && (
            <>
              <div className="iv-panel-hdr">
                <div className="iv-panel-icon iv-panel-icon--warn"><CalendarIcon /></div>
                <div>
                  <div className="iv-panel-title">Day-by-Day Preparation Plan</div>
                  <div className="iv-panel-sub">
                    {plan.length}-day guide · {totalTasks} tasks
                    {doneCt > 0 && <span className="iv-panel-sub--ok"> · {doneCt} completed ✓</span>}
                  </div>
                </div>
              </div>

              {totalTasks > 0 && (
                <div className="iv-plan-bar">
                  <div className="iv-plan-track">
                    <motion.div
                      className="iv-plan-fill"
                      initial={false}
                      animate={{ scaleX: planPct / 100 }}
                      transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
                    />
                  </div>
                  <span className="iv-plan-pct">{planPct}%</span>
                </div>
              )}

              {plan.length > 0 ? (
                <div className="iv-timeline">
                  {plan.map((day, i) => (
                    <PrepDayCard key={day.day || i} day={day} dayIndex={i} total={plan.length} done={done} onToggle={toggle} />
                  ))}
                </div>
              ) : <div className="iv-empty">No preparation plan generated. Try regenerating.</div>}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Skeleton (saved report loading) ──────────────────────────────────────────
function HistorySkeleton() {
  return (
    <div className="iv-skel" role="status" aria-label="Loading report">
      <div className="iv-skel__hero" />
      <div className="iv-skel__tabs"><i /><i /><i /><i /></div>
      <div className="iv-skel__panel"><i /><i /><i /></div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
// theme: "light" (default) | "dark" | "auto"
//   "auto" follows an app-level  <html data-theme="dark">  or  .dark  ancestor.
export default function InterviewPrep({ theme = "light" }) {
  const [searchParams] = useSearchParams();
  const reportIdParam  = searchParams.get("reportId");

  const [file,         setFile]         = useState(null);
  const [jd,           setJd]           = useState("");
  const [selfDesc,     setSelfDesc]     = useState("");
  const [title,        setTitle]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [loadingHist,  setLoadingHist]  = useState(false);
  const [report,       setReport]       = useState(null);
  const [reportId,     setReportId]     = useState(null);
  const [isHistorical, setIsHistorical] = useState(false);
  const [error,        setError]        = useState("");
  const [dragging,     setDragging]     = useState(false);
  const fileRef = useRef();

  // ── Load from URL param (from InterviewHistory "View" button) ──────────────
  useEffect(() => {
    if (reportIdParam) {
      setLoadingHist(true);
      fetchReportById(reportIdParam)
        .then((res) => {
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
    setDragging(false);
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

  const loadingSteps = [
    "Analysing your profile against the JD",
    "Generating technical questions with full model answers",
    "Building behavioral Q&A with STAR responses",
    "Creating your personalised day-by-day prep plan",
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className="iv-layout" data-theme={theme}>
        <Sidebar />
        <div className="iv-main">
          <motion.header
            className="iv-topbar"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div className="iv-topbar__text">
              <span className="iv-kicker"><i />AI-POWERED / STUDY KIT</span>
              <h1 className="iv-title">Interview <em>prep.</em></h1>
              <p className="iv-sub">AI-generated questions with full answers, skill gaps &amp; study plan</p>
            </div>
            <div className="iv-status-pill"><span className="iv-dot" /> Gemini AI</div>
          </motion.header>

          <main className="iv-body">
            {loadingHist && <HistorySkeleton />}

            {!report && !loadingHist && (
              <motion.div variants={stagger(0.07, 0.05)} initial="hidden" animate="show">
                <motion.div className="iv-section-label" variants={rise}>Configure Your Session</motion.div>

                <div className="iv-grid">
                  <motion.div className="iv-card iv-form" variants={rise}>
                    <div className="iv-field">
                      <label className="iv-label" htmlFor="iv-title">Job Title <span className="req">*</span></label>
                      <input
                        id="iv-title" className="iv-input" type="text"
                        placeholder="e.g. Software Development Intern at Google"
                        value={title} onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    <div className="iv-form-2col">
                      <div className="iv-field">
                        <label className="iv-label" htmlFor="iv-jd">
                          Job Description <span className="req">*</span>
                          <span className="iv-label__meta">{jd.trim().length} chars</span>
                        </label>
                        <textarea
                          id="iv-jd" className="iv-textarea" rows={7}
                          placeholder="Paste the full job description — requirements, responsibilities, tech stack…"
                          value={jd} onChange={(e) => setJd(e.target.value)}
                        />
                      </div>
                      <div className="iv-field">
                        <label className="iv-label" htmlFor="iv-self">About Yourself <span className="opt">(optional)</span></label>
                        <textarea
                          id="iv-self" className="iv-textarea" rows={7}
                          placeholder="Brief summary of your background, experience, and strengths… (optional but improves personalisation)"
                          value={selfDesc} onChange={(e) => setSelfDesc(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="iv-field">
                      <span className="iv-label">Resume PDF <span className="opt">(optional — improves accuracy)</span></span>
                      <div
                        className={`iv-drop ${file ? "iv-drop--has" : ""} ${dragging ? "iv-drop--drag" : ""}`}
                        role={file ? undefined : "button"}
                        tabIndex={file ? undefined : 0}
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => !file && fileRef.current.click()}
                        onKeyDown={(e) => { if (!file && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); fileRef.current.click(); } }}
                      >
                        {file ? (
                          <div className="iv-drop-file">
                            <FileIcon /><span>{file.name}</span>
                            <span className="iv-drop-size">{(file.size / 1024).toFixed(1)} KB</span>
                            <button type="button" className="iv-drop-rm" onClick={(e) => { e.stopPropagation(); setFile(null); }}>Remove</button>
                          </div>
                        ) : (
                          <div className="iv-drop-prompt"><UploadIcon /><span>Drop PDF or <strong>click to browse</strong></span></div>
                        )}
                      </div>
                      <input
                        ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }}
                        onChange={(e) => setFile(e.target.files[0] || null)}
                      />
                    </div>

                    <div className="iv-gen-row">
                      <button
                        type="button"
                        className={`iv-gen-btn ${loading ? "loading" : ""}`}
                        onClick={handleGenerate}
                        disabled={loading || !canGen}
                      >
                        {loading
                          ? <><span className="iv-spinner" /> Generating with Gemini AI…</>
                          : <><SparklesIcon /> Generate Interview Report</>}
                      </button>
                      {!canGen && <p className="iv-hint">Enter a job title and description to begin</p>}
                    </div>

                    <AnimatePresence>
                      {loading && (
                        <motion.div
                          className="iv-loading-card"
                          role="status"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.35, ease: EASE }}
                        >
                          <div className="iv-loading-bar" aria-hidden="true" />
                          {loadingSteps.map((s, i) => (
                            <motion.div
                              key={s}
                              className="iv-loading-step"
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, ease: EASE, delay: i * 0.45 }}
                            >
                              <span className="iv-loading-dot" />{s}
                            </motion.div>
                          ))}
                          <p className="iv-loading-note">Takes 30–60 sec — answer generation runs in 2 steps for completeness</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {error && <p className="iv-error" role="alert">{error}</p>}
                  </motion.div>

                  <motion.aside className="iv-aside" variants={rise}>
                    <div className="iv-card iv-pipeline">
                      <span className="iv-kicker"><i />TWO-STEP AI PIPELINE</span>
                      <ol className="iv-pipeline__steps">
                        <li className={loading ? "is-live is-live--1" : ""}>
                          <span className="iv-pipeline__num">1</span>
                          <div><b>Questions &amp; plan</b><small>Smaller prompt, complete output every time</small></div>
                        </li>
                        <li className={loading ? "is-live is-live--2" : ""}>
                          <span className="iv-pipeline__num">2</span>
                          <div><b>Model answers</b><small>Matched to each question by position</small></div>
                        </li>
                      </ol>
                    </div>

                    <div className="iv-card iv-checks">
                      <span className="iv-kicker"><i />WHAT YOU GET</span>
                      <ul>
                        {[
                          "Technical questions with model answers",
                          "Behavioral questions with STAR answers",
                          "Skill gaps ranked by severity",
                          "Day-by-day plan with a task checklist",
                          "Optional resume PDF download",
                        ].map((t) => (
                          <li key={t}><span className="iv-checks__tick"><CheckIcon /></span>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </motion.aside>
                </div>
              </motion.div>
            )}

            {report && !loadingHist && (
              <>
                <motion.div className="iv-section-label" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {isHistorical ? "Viewing Saved Report" : "Your Report"}
                </motion.div>
                <ReportView report={report} reportId={reportId} onClear={handleClear} isHistorical={isHistorical} />
              </>
            )}
          </main>
        </div>
      </div>
    </MotionConfig>
  );
}