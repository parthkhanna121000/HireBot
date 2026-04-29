import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApplicantsByJob, updateApplicationStatus } from "../services/recruiter.api";
import "../styles/applicants.scss";

// ─── Helpers ──────────────────────────────────────────────────────
const avatarColor = (str = "") => {
  const p = ["#3b82f6","#10b981","#f59e0b","#8b5cf6","#ef4444","#06b6d4","#f97316"];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  return p[Math.abs(h) % p.length];
};

const initials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0] ?? "").join("").toUpperCase() || "?";

const scoreColor = (s) =>
  s >= 80 ? "#10b981" : s >= 65 ? "#f59e0b" : s >= 50 ? "#f97316" : "#ef4444";

const STATUS_FILTERS = ["all", "applied", "shortlisted", "hired", "rejected"];

const STATUS_META = {
  applied:     { label: "Applied",     color: "#60a5fa",  bg: "rgba(59,130,246,0.1)"  },
  shortlisted: { label: "Shortlisted", color: "#34d399",  bg: "rgba(16,185,129,0.1)"  },
  hired:       { label: "Hired",       color: "#c4b5fd",  bg: "rgba(139,92,246,0.1)"  },
  rejected:    { label: "Rejected",    color: "#f87171",  bg: "rgba(239,68,68,0.1)"   },
};

const MEDALS = ["#f5c842", "#a8b2c4", "#c87d4a"];

function ScoreRing({ score, size = 48, stroke = 4 }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const fill = ((score ?? 0) / 100) * circ;
  const color = scoreColor(score ?? 0);
  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={`${fill} ${circ}`} transform={`rotate(-90 ${size/2} ${size/2})`}/>
      </svg>
      <span className="score-ring__val" style={{ color, fontSize: size < 60 ? 12 : 18, fontWeight: 800 }}>
        {score ?? "—"}
      </span>
    </div>
  );
}

function SubBar({ label, value }) {
  const color = scoreColor(value ?? 0);
  return (
    <div className="sub-bar">
      <span className="sub-bar__label">{label}</span>
      <div className="sub-bar__track">
        <div className="sub-bar__fill" style={{ width: `${value ?? 0}%`, background: color }}/>
      </div>
      <span className="sub-bar__val" style={{ color }}>{value ?? "—"}</span>
    </div>
  );
}

function Skeleton({ h=14, w="100%", r=5, style={} }) {
  return <div className="skel" style={{ height:h, width:w, borderRadius:r, ...style }}/>;
}

// ─── Drawer ───────────────────────────────────────────────────────
function Drawer({ app, onClose, onStatusChange, saving, saveError }) {
  const [note, setNote] = useState(app?.recruiterNote ?? "");
  const [noteStatus, setNS] = useState(null);

  useEffect(() => { setNote(app?.recruiterNote ?? ""); setNS(null); }, [app]);
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  if (!app) return null;
  const name = app.applicant?.username ?? "Candidate";
  const color = avatarColor(name);
  const sm = STATUS_META[app.status] ?? STATUS_META.applied;

  const handleSaveNote = async () => {
    setNS("saving");
    try { await onStatusChange(app._id, app.status, note); setNS("saved"); setTimeout(() => setNS(null), 2000); }
    catch { setNS("error"); }
  };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose}/>
      <aside className="drawer">
        {/* Header */}
        <div className="drawer__head">
          <div className="drawer__who">
            <div className="drawer__avatar" style={{ background:`${color}18`, color, border:`1.5px solid ${color}30` }}>
              {initials(name)}
            </div>
            <div>
              <div className="drawer__name">{name}</div>
              <div className="drawer__email">{app.applicant?.email ?? "—"}</div>
            </div>
          </div>
          <button className="drawer__close" onClick={onClose}>
            <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Hero */}
        <div className="drawer__hero">
          <ScoreRing score={app.matchScore} size={80} stroke={6}/>
          <div className="drawer__hero-info">
            <div className="drawer__hero-label">Overall match</div>
            <span className="status-dot" style={{ background: sm.bg, color: sm.color }}>{sm.label}</span>
            <p className="drawer__verdict">{app.aiSummary ?? "No AI summary available."}</p>
          </div>
        </div>

        {/* Scores */}
        <div className="drawer__section">
          <div className="drawer__section-title">Score breakdown</div>
          <SubBar label="Skills" value={app.skillsMatch}/>
          <SubBar label="Experience" value={app.experienceMatch}/>
          <SubBar label="Keywords" value={app.keywordsMatch}/>
        </div>

        {/* Tags */}
        {app.strengths?.length > 0 && (
          <div className="drawer__section">
            <div className="drawer__section-title">Strengths</div>
            <div className="tag-group">
              {app.strengths.map((s,i) => <span key={i} className="tag tag--green">{s}</span>)}
            </div>
          </div>
        )}

        {app.missingSkills?.length > 0 && (
          <div className="drawer__section">
            <div className="drawer__section-title">Missing skills</div>
            <div className="tag-group">
              {app.missingSkills.map((s,i) => <span key={i} className="tag tag--red">{s}</span>)}
            </div>
          </div>
        )}

        {app.weaknesses?.length > 0 && (
          <div className="drawer__section">
            <div className="drawer__section-title">Gaps</div>
            <div className="tag-group">
              {app.weaknesses.map((w,i) => <span key={i} className="tag tag--amber">{w}</span>)}
            </div>
          </div>
        )}

        {/* Note */}
        <div className="drawer__section">
          <div className="drawer__section-title">Recruiter note</div>
          <textarea className="drawer__note" rows={3} placeholder="Add a private note about this candidate…"
            value={note} onChange={(e) => { setNote(e.target.value); setNS(null); }}/>
          <div className="drawer__note-footer">
            {noteStatus === "saved" && <span className="note-status success">✓ Saved</span>}
            {noteStatus === "error" && <span className="note-status error">Failed</span>}
            <button className="note-save-btn" onClick={handleSaveNote} disabled={noteStatus === "saving"}>
              {noteStatus === "saving" ? "Saving…" : "Save note"}
            </button>
          </div>
        </div>

        {/* Decision */}
        <div className="drawer__decisions">
          {app.status !== "shortlisted" && (
            <button className="decision-btn shortlist" onClick={() => onStatusChange(app._id, "shortlisted")} disabled={saving}>
              Shortlist
            </button>
          )}
          {app.status !== "hired" && (
            <button className="decision-btn hire" onClick={() => onStatusChange(app._id, "hired")} disabled={saving}>
              Hire
            </button>
          )}
          {app.status !== "rejected" && (
            <button className="decision-btn reject" onClick={() => onStatusChange(app._id, "rejected")} disabled={saving}>
              Reject
            </button>
          )}
        </div>
        {saveError && <div className="drawer__save-error">{saveError}</div>}
      </aside>
    </>
  );
}

// ─── Main ────────────────────────────────────────────────────────
export default function ApplicantsRanking() {
  const { jobId } = useParams();
  const navigate  = useNavigate();
  const [apps, setApps]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [filter, setFilter]   = useState("all");
  const [selected, setSelected] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [saveError, setSaveError] = useState("");
  const [jobTitle, setJobTitle] = useState("Applicants");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await getApplicantsByJob(jobId);
      data.sort((a,b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
      setApps(data);
      if (data[0]?.job?.title) setJobTitle(data[0].job.title);
    } catch(e) {
      setError(e.response?.data?.message || "Failed to load applicants.");
    } finally { setLoading(false); }
  }, [jobId]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (appId, status, recruiterNote) => {
    setSaving(true); setSaveError("");
    try {
      await updateApplicationStatus(appId, status, recruiterNote);
      setApps(prev => prev.map(a => a._id === appId ? { ...a, status, ...(recruiterNote !== undefined ? { recruiterNote } : {}) } : a));
      setSelected(prev => prev?._id === appId ? { ...prev, status, ...(recruiterNote !== undefined ? { recruiterNote } : {}) } : prev);
    } catch(e) {
      setSaveError(e.response?.data?.message || "Action failed.");
    } finally { setSaving(false); }
  };

  const filtered = filter === "all" ? apps : apps.filter(a => a.status === filter);
  const countFor = (s) => s === "all" ? apps.length : apps.filter(a => a.status === s).length;

  return (
    <div className="ar">
      {/* Header */}
      <header className="ar__header">
        <button className="ar__back" onClick={() => navigate("/recruiter")}>
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Dashboard
        </button>
        <div className="ar__header-center">
          <p className="ar__eyebrow">Applicant rankings</p>
          <h1 className="ar__title">{jobTitle}</h1>
        </div>
        <div className="ar__header-right">
          <div className="ar__total">
            <span className="ar__total-num">{apps.length}</span>
            <span className="ar__total-label">applicants</span>
          </div>
          <button className="ar__refresh" onClick={load} title="Refresh">
            <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
              <path d="M17.65 6.35A7.958 7.958 0 0010 2C5.58 2 2 5.58 2 10s3.58 8 8 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0110 16c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L11 9h7V2l-2.35 4.35z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Filter tabs */}
      <div className="ar__filters">
        {STATUS_FILTERS.map(f => (
          <button key={f} className={`ar__filter-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : STATUS_META[f]?.label}
            <span className="ar__filter-count">{countFor(f)}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="ar__error">
          {error} <button onClick={load}>Retry →</button>
        </div>
      )}

      {/* Table */}
      <div className="ar__body">
        <div className="ar__table">
          {/* Column labels */}
          <div className="ar__col-labels">
            <div className="ar__cl ar__cl--rank">#</div>
            <div className="ar__cl ar__cl--name">Candidate</div>
            <div className="ar__cl ar__cl--score">Score</div>
            <div className="ar__cl ar__cl--breakdown">Breakdown</div>
            <div className="ar__cl ar__cl--status">Status</div>
            <div className="ar__cl ar__cl--actions">Actions</div>
          </div>

          {/* Rows */}
          <div className="ar__rows">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div className="ar-row skel-row" key={i}>
                    <Skeleton h={20} w={28} r={5}/>
                    <div style={{ display:"flex", alignItems:"center", gap:10, flex:1 }}>
                      <Skeleton h={38} w={38} r={19}/>
                      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
                        <Skeleton h={13} w="55%"/><Skeleton h={11} w="36%"/>
                      </div>
                    </div>
                    <Skeleton h={44} w={44} r={22}/>
                    <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
                      {[70,55,80].map((w,i) => <Skeleton key={i} h={10} w={`${w}%`}/>)}
                    </div>
                    <Skeleton h={22} w={80} r={20}/>
                    <Skeleton h={28} w={60} r={7}/>
                  </div>
                ))
              : filtered.length === 0
              ? <div className="ar__empty">{filter === "all" ? "No applicants yet." : `No ${filter} candidates.`}</div>
              : filtered.map((app, idx) => {
                  const globalRank = apps.indexOf(app);
                  const name = app.applicant?.username ?? "Candidate";
                  const color = avatarColor(name);
                  const sm = STATUS_META[app.status] ?? STATUS_META.applied;
                  const isSelected = selected?._id === app._id;
                  const isTop = globalRank < 3;

                  return (
                    <div
                      key={app._id}
                      className={`ar-row ${isSelected ? "ar-row--selected" : ""} ${globalRank === 0 ? "ar-row--gold" : ""}`}
                      style={{ animationDelay: `${idx * 35}ms` }}
                    >
                      {/* Rank */}
                      <div className="ar-row__rank">
                        {isTop
                          ? <span className="medal" style={{ color: MEDALS[globalRank] }}>{globalRank + 1}</span>
                          : <span className="rank-num">{globalRank + 1}</span>}
                      </div>

                      {/* Identity */}
                      <div className="ar-row__identity">
                        <div className="ar-row__avatar" style={{ background:`${color}15`, color, border:`1.5px solid ${color}30` }}>
                          {initials(name)}
                        </div>
                        <div>
                          <div className="ar-row__name">{name}</div>
                          <div className="ar-row__email">{app.applicant?.email ?? "—"}</div>
                        </div>
                      </div>

                      {/* Score ring */}
                      <div className="ar-row__score">
                        <ScoreRing score={app.matchScore} size={46} stroke={4}/>
                      </div>

                      {/* Breakdown bars */}
                      <div className="ar-row__breakdown">
                        <SubBar label="Skills" value={app.skillsMatch}/>
                        <SubBar label="Exp." value={app.experienceMatch}/>
                        <SubBar label="KW" value={app.keywordsMatch}/>
                      </div>

                      {/* Status */}
                      <div className="ar-row__status">
                        <span className="status-dot" style={{ background: sm.bg, color: sm.color }}>{sm.label}</span>
                      </div>

                      {/* Actions */}
                      <div className="ar-row__actions">
                        <button className={`action-btn view ${isSelected ? "active" : ""}`}
                          onClick={() => setSelected(isSelected ? null : app)}>
                          {isSelected ? "Close" : "Details"}
                        </button>
                        {app.status !== "shortlisted" && app.status !== "hired" && (
                          <button className="action-btn shortlist" title="Shortlist"
                            onClick={() => handleStatusChange(app._id, "shortlisted")} disabled={saving}>✓</button>
                        )}
                        {app.status !== "rejected" && (
                          <button className="action-btn reject" title="Reject"
                            onClick={() => handleStatusChange(app._id, "rejected")} disabled={saving}>✕</button>
                        )}
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>

      {selected && (
        <Drawer app={selected} onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange} saving={saving} saveError={saveError}/>
      )}
    </div>
  );
}