import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../shared/Sidebar";
import { fetchAllReports, deleteReport } from "../services/interview.api";
import "./InterviewHistory.scss";

// ─── Icons ────────────────────────────────────────────────────────────────────
const EyeIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const TrashIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;
const TrendUpIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const CalIcon     = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const BookmarkIcon= () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>;
const PlusIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ringColor = (s) => s >= 80 ? "#10b981" : s >= 65 ? "#6366f1" : s >= 50 ? "#f59e0b" : "#f43f5e";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
}

function ScoreBadge({ score }) {
  const color = ringColor(score);
  return (
    <div className="ih-score-badge" style={{ color, background:`${color}18`, border:`1px solid ${color}30` }}>
      {score}<span>/100</span>
    </div>
  );
}

function ScoreDelta({ current, previous }) {
  const diff = current - previous;
  if (diff === 0) return <span className="ih-delta ih-delta--flat">= same</span>;
  return (
    <span className={`ih-delta ${diff > 0 ? "ih-delta--up" : "ih-delta--down"}`}>
      <TrendUpIcon/> {diff > 0 ? "+" : ""}{diff}
    </span>
  );
}

// ─── Mini progress ring ───────────────────────────────────────────────────────
function MiniRing({ score }) {
  const r = 18, circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = ringColor(score);
  return (
    <div className="ih-mini-ring">
      <svg width="46" height="46" viewBox="0 0 46 46">
        <circle cx="23" cy="23" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4"/>
        <circle cx="23" cy="23" r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`} transform="rotate(-90 23 23)"
          style={{ transition:"stroke-dasharray 0.8s" }}/>
      </svg>
      <span className="ih-mini-score" style={{ color }}>{score}</span>
    </div>
  );
}

// ─── Report Card ──────────────────────────────────────────────────────────────
function ReportCard({ report, index, total, onView, onDelete, prevScore }) {
  const [deleting, setDeleting] = useState(false);
  const tqCount = report.technicalQuestions?.length  || 0;
  const bqCount = report.behavioralQuestions?.length || 0;
  const dayCount = report.preparationPlan?.length    || 0;

  const handleDelete = async () => {
    if (!confirm("Delete this report permanently?")) return;
    setDeleting(true);
    try { await onDelete(report._id); }
    finally { setDeleting(false); }
  };

  return (
    <div className="ih-card">
      <div className="ih-card-left">
        <div className="ih-card-rank">#{total - index}</div>
        <MiniRing score={report.matchScore || 0}/>
      </div>

      <div className="ih-card-body">
        <div className="ih-card-title">{report.title}</div>
        <div className="ih-card-meta">
          <span><CalIcon/> {formatDate(report.createdAt)}</span>
          <span>{tqCount} tech Qs</span>
          <span>{bqCount} behavioral Qs</span>
          <span>{dayCount}-day plan</span>
        </div>
        {report.skillGaps?.length > 0 && (
          <div className="ih-card-gaps">
            {report.skillGaps.slice(0, 3).map(g => (
              <span key={g.skill} className="ih-gap-chip"
                style={{ color: g.severity==="high"?"#f43f5e":g.severity==="medium"?"#f59e0b":"#a5b4fc",
                         background: g.severity==="high"?"rgba(244,63,94,0.1)":g.severity==="medium"?"rgba(245,158,11,0.1)":"rgba(99,102,241,0.1)" }}>
                {g.skill}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="ih-card-right">
        {prevScore !== undefined && <ScoreDelta current={report.matchScore} previous={prevScore}/>}
        <button className="ih-btn ih-btn--view"   onClick={() => onView(report._id)}><EyeIcon/> View</button>
        <button className="ih-btn ih-btn--delete" onClick={handleDelete} disabled={deleting}>
          <TrashIcon/> {deleting ? "…" : "Delete"}
        </button>
      </div>
    </div>
  );
}

// ─── Saved Questions Panel ────────────────────────────────────────────────────
function SavedQuestionsPanel({ reports }) {
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hirebot_saved_questions") || "[]"); }
    catch { return []; }
  });

  const saveQuestion = (q, source) => {
    const entry = { id: Date.now(), question: q.question, answer: q.answer, source, savedAt: new Date().toISOString() };
    const updated = [entry, ...saved].slice(0, 30);
    setSaved(updated);
    localStorage.setItem("hirebot_saved_questions", JSON.stringify(updated));
  };

  const removeQuestion = (id) => {
    const updated = saved.filter(q => q.id !== id);
    setSaved(updated);
    localStorage.setItem("hirebot_saved_questions", JSON.stringify(updated));
  };

  const allQuestions = reports.flatMap(r => [
    ...(r.technicalQuestions  || []).map(q => ({ ...q, source: r.title, reportId: r._id })),
    ...(r.behavioralQuestions || []).map(q => ({ ...q, source: r.title, reportId: r._id })),
  ]);

  return (
    <div className="ih-saved">
      <div className="ih-saved-header">
        <BookmarkIcon/> Practice List
        <span className="ih-saved-count">{saved.length}</span>
      </div>

      {saved.length === 0 ? (
        <p className="ih-saved-empty">
          No saved questions yet.<br/>Click ⭐ next to any question across your reports to save it here.
        </p>
      ) : (
        <div className="ih-saved-list">
          {saved.map(q => (
            <div className="ih-saved-item" key={q.id}>
              <div className="ih-saved-q">{q.question}</div>
              <div className="ih-saved-src">{q.source}</div>
              {q.answer && <div className="ih-saved-ans">{q.answer.substring(0, 100)}…</div>}
              <button className="ih-saved-remove" onClick={() => removeQuestion(q.id)}>×</button>
            </div>
          ))}
        </div>
      )}

      {allQuestions.length > 0 && (
        <details className="ih-qs-source">
          <summary>Browse questions to save ({allQuestions.length})</summary>
          <div className="ih-qs-list">
            {allQuestions.map((q, i) => {
              const alreadySaved = saved.some(s => s.question === q.question);
              return (
                <div className="ih-qs-item" key={i}>
                  <span className="ih-qs-text">{q.question}</span>
                  {!alreadySaved && (
                    <button className="ih-qs-save" onClick={() => saveQuestion(q, q.source)}>
                      <PlusIcon/> Save
                    </button>
                  )}
                  {alreadySaved && <span className="ih-qs-saved-label">Saved ✓</span>}
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}

// ─── Score Chart ──────────────────────────────────────────────────────────────
function ScoreChart({ reports }) {
  if (reports.length < 2) return null;
  const last5 = [...reports].reverse().slice(0, 5);
  const max = 100;
  const h = 80;

  return (
    <div className="ih-chart">
      <div className="ih-chart-title">Score progression</div>
      <svg viewBox={`0 0 ${last5.length * 60} ${h + 20}`} width="100%" style={{ overflow:"visible" }}>
        {last5.map((r, i) => {
          const x = i * 60 + 24;
          const y = h - (r.matchScore / max) * (h - 8);
          const color = ringColor(r.matchScore);
          return (
            <g key={r._id}>
              {i > 0 && (() => {
                const prev = last5[i-1];
                const px = (i-1)*60+24, py = h-(prev.matchScore/max)*(h-8);
                return <line x1={px} y1={py} x2={x} y2={y} stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" strokeDasharray="3 2"/>;
              })()}
              <circle cx={x} cy={y} r="5" fill={color}/>
              <text x={x} y={y-10} textAnchor="middle" fill={color} fontSize="11" fontWeight="700">{r.matchScore}</text>
              <text x={x} y={h+16} textAnchor="middle" fill="#44445a" fontSize="9">
                {new Date(r.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InterviewHistory() {
  const navigate  = useNavigate();
  const [reports, setReports]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState("");

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
    setReports(prev => prev.filter(r => r._id !== id));
  };
  const handleNewReport = () => navigate("/interview-prep");

  const bestScore  = reports.length ? Math.max(...reports.map(r => r.matchScore||0)) : 0;
  const latestDiff = reports.length >= 2 ? (reports[0].matchScore||0) - (reports[1].matchScore||0) : 0;
  const avgScore   = reports.length ? Math.round(reports.reduce((a,r)=>a+(r.matchScore||0),0)/reports.length) : 0;

  return (
    <div className="ih-layout">
      <div className="ih-orb ih-orb-1"/><div className="ih-orb ih-orb-2"/>
      <Sidebar/>
      <div className="ih-main">
        <header className="ih-topbar">
          <div>
            <div className="ih-topbar-title">Interview Reports</div>
            <div className="ih-topbar-sub">Your interview preparation history & progress</div>
          </div>
          <button className="ih-new-btn" onClick={handleNewReport}><PlusIcon/> New Report</button>
        </header>

        <main className="ih-body">
          {loading && <div className="ih-loading">Loading your reports…</div>}
          {error   && <div className="ih-error">{error}</div>}

          {!loading && !error && reports.length === 0 && (
            <div className="ih-empty">
              <div className="ih-empty-icon">📄</div>
              <p>No interview reports yet.</p>
              <button className="ih-new-btn" onClick={handleNewReport}><PlusIcon/> Generate your first report</button>
            </div>
          )}

          {!loading && reports.length > 0 && (
            <div className="ih-content">
              {/* ── Stats Row ── */}
              <div className="ih-stats">
                <div className="ih-stat-card">
                  <div className="ih-stat-n">{reports.length}</div>
                  <div className="ih-stat-l">Total Reports</div>
                </div>
                <div className="ih-stat-card">
                  <div className="ih-stat-n" style={{ color: ringColor(avgScore) }}>{avgScore}</div>
                  <div className="ih-stat-l">Average Score</div>
                </div>
                <div className="ih-stat-card">
                  <div className="ih-stat-n" style={{ color: ringColor(bestScore) }}>{bestScore}</div>
                  <div className="ih-stat-l">Best Score</div>
                </div>
                <div className="ih-stat-card">
                  <div className="ih-stat-n">
                    {latestDiff > 0 ? <span style={{color:"#10b981"}}>+{latestDiff}</span>
                     : latestDiff < 0 ? <span style={{color:"#f43f5e"}}>{latestDiff}</span>
                     : <span style={{color:"#8888aa"}}>—</span>}
                  </div>
                  <div className="ih-stat-l">Latest Change</div>
                </div>
              </div>

              {/* ── Score Chart ── */}
              <ScoreChart reports={reports}/>

              {/* ── Report List + Saved Questions side by side ── */}
              <div className="ih-two-col">
                <div className="ih-report-list">
                  <div className="ih-list-header">
                    <span>Reports</span>
                    <span className="ih-list-count">{reports.length}</span>
                  </div>
                  {reports.map((r, i) => (
                    <ReportCard
                      key={r._id} report={r} index={i} total={reports.length}
                      onView={handleView} onDelete={handleDelete}
                      prevScore={i < reports.length-1 ? reports[i+1].matchScore : undefined}
                    />
                  ))}
                </div>

                <SavedQuestionsPanel reports={reports}/>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}