import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import Sidebar from "../../shared/Sidebar";
import { fetchAllReports, deleteReport } from "../services/interview.api";
import "./InterviewHistory.scss";

const SAVED_KEY = "hirebot_saved_questions";

// ─── Icons ────────────────────────────────────────────────────────────────────
const EyeIcon      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const TrashIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;
const TrendUpIcon  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const CalIcon      = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const BookmarkIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>;
const PlusIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const CheckIcon    = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const CloseIcon    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const FileIcon     = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>;
const ChevronIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;

// ─── Motion presets ───────────────────────────────────────────────────────────
const EASE = [0.2, 0.7, 0.2, 1];
const rise = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};
const stagger = (s = 0.07, d = 0) => ({
  hidden: {},
  show:   { transition: { staggerChildren: s, delayChildren: d } },
});
const cardV = {
  hidden: { opacity: 0, y: 14 },
  show: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: EASE, delay: 0.25 + Math.min(i, 8) * 0.06 },
  }),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const band    = (s) => (s >= 80 ? "great" : s >= 65 ? "good" : s >= 50 ? "mid" : "low");
const sevKey  = (s) => (["high", "medium", "low"].includes(s) ? s : "low");

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function shortDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function useCountUp(target, duration = 900) {
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

const readSaved = () => {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"); }
  catch { return []; }
};
const writeSaved = (list) => {
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(list)); } catch { /* ignore */ }
};

// ─── Score delta ──────────────────────────────────────────────────────────────
function ScoreDelta({ current, previous }) {
  const diff = (current || 0) - (previous || 0);
  if (diff === 0) return <span className="ih-delta ih-delta--flat">= same</span>;
  return (
    <span className={`ih-delta ${diff > 0 ? "ih-delta--up" : "ih-delta--down"}`}>
      <TrendUpIcon /> {diff > 0 ? "+" : ""}{diff}
    </span>
  );
}

// ─── Mini progress ring ───────────────────────────────────────────────────────
function MiniRing({ score }) {
  const reduce = useReducedMotion();
  const value  = Math.max(0, Math.min(100, Number(score) || 0));
  const r = 18, circ = 2 * Math.PI * r;
  const n = useCountUp(value, 900);
  return (
    <div className={`ih-ring ih-ring--${band(value)}`}>
      <svg width="46" height="46" viewBox="0 0 46 46" aria-hidden="true">
        <circle className="ih-ring__track" cx="23" cy="23" r={r} />
        <motion.circle
          className="ih-ring__value" cx="23" cy="23" r={r}
          strokeDasharray={circ}
          initial={{ strokeDashoffset: reduce ? circ * (1 - value / 100) : circ }}
          animate={{ strokeDashoffset: circ * (1 - value / 100) }}
          transition={{ duration: reduce ? 0 : 1, ease: EASE, delay: 0.3 }}
        />
      </svg>
      <span className="ih-ring__num">{n}</span>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, tone, signed }) {
  const n = useCountUp(Math.abs(value), 900);
  let display;
  if (signed) {
    display = value === 0 ? "—" : `${value > 0 ? "+" : "−"}${n}`;
  } else {
    display = n;
  }
  const cls = signed
    ? value > 0 ? "ih-stat-n--great" : value < 0 ? "ih-stat-n--low" : "ih-stat-n--flat"
    : tone ? `ih-stat-n--${tone}` : "";
  return (
    <motion.div className="ih-stat-card" variants={rise} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
      <div className="ih-stat-l">{label}</div>
      <div className={`ih-stat-n ${cls}`}>{display}</div>
    </motion.div>
  );
}

// ─── Report Card ──────────────────────────────────────────────────────────────
function ReportCard({ report, index, total, onView, onDelete, prevScore, isBest }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [failed,     setFailed]     = useState(false);

  const tqCount  = report.technicalQuestions?.length  || 0;
  const bqCount  = report.behavioralQuestions?.length || 0;
  const dayCount = report.preparationPlan?.length     || 0;

  const handleDelete = async () => {
    setDeleting(true); setFailed(false);
    try { await onDelete(report._id); }
    catch { setFailed(true); setDeleting(false); setConfirming(false); }
  };

  return (
    <div className="ih-card">
      <div className="ih-card-left">
        <div className="ih-card-rank">#{total - index}</div>
        <MiniRing score={report.matchScore || 0} />
      </div>

      <div className="ih-card-body">
        <div className="ih-card-title-row">
          <div className="ih-card-title">{report.title}</div>
          {isBest && <span className="ih-best">BEST</span>}
        </div>
        <div className="ih-card-meta">
          <span><CalIcon /> {formatDate(report.createdAt)}</span>
          <span>{tqCount} tech Qs</span>
          <span>{bqCount} behavioral Qs</span>
          <span>{dayCount}-day plan</span>
        </div>
        {report.skillGaps?.length > 0 && (
          <div className="ih-card-gaps">
            {report.skillGaps.slice(0, 3).map((g) => (
              <span key={g.skill} className={`ih-gap-chip ih-gap-chip--${sevKey(g.severity)}`}>{g.skill}</span>
            ))}
          </div>
        )}
        {failed && <p className="ih-card-fail" role="alert">Could not delete this report. Try again.</p>}
      </div>

      <div className="ih-card-right">
        {prevScore !== undefined && <ScoreDelta current={report.matchScore} previous={prevScore} />}
        <div className="ih-card-actions">
          <button type="button" className="ih-btn ih-btn--view" onClick={() => onView(report._id)}>
            <EyeIcon /> View
          </button>

          <AnimatePresence mode="wait" initial={false}>
            {confirming ? (
              <motion.div
                key="confirm"
                className="ih-confirm"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.18 }}
              >
                <button type="button" className="ih-btn ih-btn--danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "…" : "Delete?"}
                </button>
                <button type="button" className="ih-btn ih-btn--ghost" onClick={() => setConfirming(false)} disabled={deleting} aria-label="Cancel delete">
                  <CloseIcon />
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="delete"
                type="button"
                className="ih-btn ih-btn--delete"
                onClick={() => setConfirming(true)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <TrashIcon /> Delete
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Saved Questions Panel ────────────────────────────────────────────────────
function SavedQuestionsPanel({ reports }) {
  const [saved, setSaved] = useState(readSaved);

  const saveQuestion = (q, source) => {
    const entry = { id: Date.now(), question: q.question, answer: q.answer, source, savedAt: new Date().toISOString() };
    const updated = [entry, ...saved].slice(0, 30);
    setSaved(updated);
    writeSaved(updated);
  };

  const removeQuestion = (id) => {
    const updated = saved.filter((q) => q.id !== id);
    setSaved(updated);
    writeSaved(updated);
  };

  const allQuestions = reports.flatMap((r) => [
    ...(r.technicalQuestions  || []).map((q) => ({ ...q, source: r.title, reportId: r._id })),
    ...(r.behavioralQuestions || []).map((q) => ({ ...q, source: r.title, reportId: r._id })),
  ]);

  return (
    <motion.aside className="ih-saved" variants={rise}>
      <div className="ih-saved-header">
        <span className="ih-saved-icon"><BookmarkIcon /></span>
        <div>
          <span className="ih-kicker"><i />PRACTICE LIST</span>
          <div className="ih-saved-title">Saved questions</div>
        </div>
        <span className="ih-saved-count">{saved.length}</span>
      </div>

      {saved.length === 0 ? (
        <p className="ih-saved-empty">
          No saved questions yet.<br />Open “Browse questions to save” below and tap Save next to any question.
        </p>
      ) : (
        <div className="ih-saved-list">
          <AnimatePresence initial={false}>
            {saved.map((q) => (
              <motion.div
                className="ih-saved-item"
                key={q.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 16, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <div className="ih-saved-q">{q.question}</div>
                <div className="ih-saved-src">{q.source}</div>
                {q.answer && <div className="ih-saved-ans">{q.answer.substring(0, 100)}…</div>}
                <button type="button" className="ih-saved-remove" onClick={() => removeQuestion(q.id)} aria-label="Remove saved question">
                  <CloseIcon />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {allQuestions.length > 0 && (
        <details className="ih-qs-source">
          <summary><span>Browse questions to save ({allQuestions.length})</span><ChevronIcon /></summary>
          <div className="ih-qs-list">
            {allQuestions.map((q, i) => {
              const alreadySaved = saved.some((s) => s.question === q.question);
              return (
                <div className="ih-qs-item" key={i}>
                  <span className="ih-qs-text">{q.question}</span>
                  {!alreadySaved && (
                    <button type="button" className="ih-qs-save" onClick={() => saveQuestion(q, q.source)}>
                      <PlusIcon /> Save
                    </button>
                  )}
                  {alreadySaved && <span className="ih-qs-saved-label"><CheckIcon /> Saved</span>}
                </div>
              );
            })}
          </div>
        </details>
      )}
    </motion.aside>
  );
}

// ─── Score Chart ──────────────────────────────────────────────────────────────
function ScoreChart({ reports }) {
  const reduce = useReducedMotion();
  // latest five reports, oldest → newest
  const pts = [...reports].slice(0, 5).reverse();
  const [active, setActive] = useState(pts.length - 1);

  if (reports.length < 2) return null;

  const n   = pts.length;
  const cur = Math.min(active, n - 1);
  const xOf = (i) => 9 + (i * 82) / (n - 1);
  const yOf = (s) => 8 + 84 * (1 - Math.max(0, Math.min(100, s || 0)) / 100);

  const line = pts.map((p, i) => `${i ? "L" : "M"}${xOf(i)} ${yOf(p.matchScore)}`).join(" ");
  const area = `${line} L${xOf(n - 1)} ${yOf(0)} L${xOf(0)} ${yOf(0)} Z`;
  const a    = pts[cur];

  return (
    <motion.div className="ih-chart" variants={rise}>
      <div className="ih-chart-head">
        <div>
          <span className="ih-kicker"><i />SCORE PROGRESSION</span>
          <div className="ih-chart-title">Last {n} reports</div>
        </div>
        <div className="ih-chart-readout" aria-live="polite">
          <b>{a.title}</b>
          <span>{shortDate(a.createdAt)} · <strong className={`ih-tone--${band(a.matchScore)}`}>{a.matchScore}/100</strong></span>
        </div>
      </div>

      <div className="ih-chart-plot">
        {[100, 50, 0].map((g) => (
          <span key={g} className="ih-chart-grid" style={{ top: `${yOf(g)}%` }}><em>{g}</em></span>
        ))}

        <svg className="ih-chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="ih-area-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--iv-accent)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--iv-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d={area} fill="url(#ih-area-fill)" stroke="none"
            initial={{ opacity: reduce ? 1 : 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          />
          <motion.path
            className="ih-chart-line" d={line} fill="none"
            initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: reduce ? 0 : 1.1, ease: EASE, delay: 0.2 }}
          />
        </svg>

        {pts.map((p, i) => (
          <span key={p._id} className="ih-pt-wrap" style={{ left: `${xOf(i)}%`, top: `${yOf(p.matchScore)}%` }}>
            <motion.button
              type="button"
              className={`ih-pt ih-pt--${band(p.matchScore)} ${i === cur ? "ih-pt--active" : ""}`}
              aria-label={`${p.title}: ${p.matchScore} out of 100, ${shortDate(p.createdAt)}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              initial={{ scale: reduce ? 1 : 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 22, delay: reduce ? 0 : 0.5 + i * 0.1 }}
            />
            <span className={`ih-pt-val ${i === cur ? "ih-pt-val--active" : ""}`}>{p.matchScore}</span>
          </span>
        ))}

        {pts.map((p, i) => (
          <span key={`d-${p._id}`} className="ih-chart-date" style={{ left: `${xOf(i)}%` }}>{shortDate(p.createdAt)}</span>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function HistorySkeleton() {
  return (
    <div className="ih-skel" role="status" aria-label="Loading your reports">
      <div className="ih-skel__stats"><i /><i /><i /><i /></div>
      <div className="ih-skel__chart" />
      <div className="ih-skel__cols">
        <div className="ih-skel__list"><i /><i /><i /></div>
        <div className="ih-skel__side" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
// theme: "light" (default) | "dark" | "auto"
//   "auto" follows an app-level  <html data-theme="dark">  or  .dark  ancestor.
export default function InterviewHistory({ theme = "light" }) {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchAllReports();
        if (res.success) setReports(res.data || []);
        else setError("Failed to load reports.");
      } catch { setError("Could not fetch reports. Check your connection."); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleView   = (id) => navigate(`/interview-prep?reportId=${id}`);
  const handleDelete = async (id) => {
    await deleteReport(id);
    setReports((prev) => prev.filter((r) => r._id !== id));
  };
  const handleNewReport = () => navigate("/interview-prep");

  const bestScore  = reports.length ? Math.max(...reports.map((r) => r.matchScore || 0)) : 0;
  const latestDiff = reports.length >= 2 ? (reports[0].matchScore || 0) - (reports[1].matchScore || 0) : 0;
  const avgScore   = reports.length ? Math.round(reports.reduce((a, r) => a + (r.matchScore || 0), 0) / reports.length) : 0;

  return (
    <MotionConfig reducedMotion="user">
      <div className="ih-layout" data-theme={theme}>
        <Sidebar />
        <div className="ih-main">
          <motion.header
            className="ih-topbar"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div className="ih-topbar__text">
              <span className="ih-kicker"><i />HISTORY / PROGRESS</span>
              <h1 className="ih-title">Interview <em>reports.</em></h1>
              <p className="ih-sub">Your interview preparation history &amp; progress</p>
            </div>
            <button type="button" className="ih-new-btn" onClick={handleNewReport}><PlusIcon /> New Report</button>
          </motion.header>

          <main className="ih-body">
            {loading && <HistorySkeleton />}
            {error && <div className="ih-error" role="alert">{error}</div>}

            {!loading && !error && reports.length === 0 && (
              <motion.div className="ih-empty" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                <div className="ih-empty-icon"><FileIcon /></div>
                <h2 className="ih-empty-title">No reports <em>yet.</em></h2>
                <p>Generate your first interview kit and track your progress here.</p>
                <button type="button" className="ih-new-btn" onClick={handleNewReport}><PlusIcon /> Generate your first report</button>
              </motion.div>
            )}

            {!loading && reports.length > 0 && (
              <motion.div className="ih-content" variants={stagger(0.07, 0.05)} initial="hidden" animate="show">
                {/* ── Stats ── */}
                <div className="ih-stats">
                  <StatCard label="Total Reports"  value={reports.length} />
                  <StatCard label="Average Score"  value={avgScore}  tone={band(avgScore)} />
                  <StatCard label="Best Score"     value={bestScore} tone={band(bestScore)} />
                  <StatCard label="Latest Change"  value={latestDiff} signed />
                </div>

                {/* ── Chart ── */}
                <ScoreChart reports={reports} />

                {/* ── List + Saved ── */}
                <div className="ih-two-col">
                  <div className="ih-report-list">
                    <div className="ih-list-header">
                      <span>Reports</span>
                      <span className="ih-list-count">{reports.length}</span>
                    </div>
                    <AnimatePresence mode="popLayout">
                      {reports.map((r, i) => (
                        <motion.div
                          key={r._id}
                          layout
                          custom={i}
                          variants={cardV}
                          initial="hidden"
                          animate="show"
                          exit={{ opacity: 0, x: -24, scale: 0.98, transition: { duration: 0.25 } }}
                          className="ih-card-wrap"
                        >
                          <ReportCard
                            report={r} index={i} total={reports.length}
                            onView={handleView} onDelete={handleDelete}
                            prevScore={i < reports.length - 1 ? reports[i + 1].matchScore : undefined}
                            isBest={reports.length > 1 && (r.matchScore || 0) === bestScore}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <SavedQuestionsPanel reports={reports} />
                </div>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </MotionConfig>
  );
}