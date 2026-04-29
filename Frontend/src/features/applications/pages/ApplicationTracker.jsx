import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../shared/Sidebar";
import "../styles/applications.scss";

const ax = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
  Briefcase:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>,
  Check:       () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Clock:       () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  X:           () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Zap:         () => <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  MapPin:      () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  ArrowRight:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  ArrowUpRight:() => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>,
  Star:        () => <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Spark:       () => <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>,
  TrendUp:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
};

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS = {
  applied:     { label: "Applied",     color: "#60a5fa", dim: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.25)",  icon: Icons.Clock, step: 0 },
  shortlisted: { label: "Shortlisted", color: "#34d399", dim: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.25)",  icon: Icons.Star,  step: 1 },
  rejected:    { label: "Rejected",    color: "#f87171", dim: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.25)", icon: Icons.X,     step: -1 },
  hired:       { label: "Hired",       color: "#fbbf24", dim: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.25)",  icon: Icons.Zap,   step: 2 },
};

const STEPS = ["Applied", "Shortlisted", "Hired"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const timeAgo = (date) => {
  const d = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7)   return `${d}d ago`;
  if (d < 30)  return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
};

const scoreColor = (s) => {
  if (!s && s !== 0) return "#444";
  if (s >= 75) return "#34d399";
  if (s >= 50) return "#fbbf24";
  return "#f87171";
};

const initials = (name = "") =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

const LOGO_COLORS = [
  ["rgba(96,165,250,0.15)",  "#60a5fa"],
  ["rgba(52,211,153,0.15)",  "#34d399"],
  ["rgba(167,139,250,0.15)", "#a78bfa"],
  ["rgba(251,191,36,0.15)",  "#fbbf24"],
  ["rgba(248,113,113,0.12)", "#f87171"],
  ["rgba(244,114,182,0.12)", "#f472b6"],
];
const logoColor = (s = "") => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return LOGO_COLORS[Math.abs(h) % LOGO_COLORS.length];
};

// ─── Pipeline Banner ──────────────────────────────────────────────────────────
function PipelineBanner({ stats }) {
  const total = stats.total || 0;
  const pct = (n) => (total ? Math.round(((n || 0) / total) * 100) : 0);
  const cards = [
    { label: "Applied",     val: stats.applied,     color: "#60a5fa", dim: "rgba(96,165,250,0.10)"  },
    { label: "Shortlisted", val: stats.shortlisted, color: "#34d399", dim: "rgba(52,211,153,0.10)"  },
    { label: "Hired",       val: stats.hired,       color: "#fbbf24", dim: "rgba(251,191,36,0.10)"  },
    { label: "Rejected",    val: stats.rejected,    color: "#f87171", dim: "rgba(248,113,113,0.08)" },
  ];

  return (
    <div className="at-pipeline">
      <div className="at-pipeline__header">
        <span className="at-pipeline__title">Application Pipeline</span>
        <span className="at-pipeline__total">{total} total</span>
      </div>

      {/* Stat cards */}
      <div className="at-pipeline__cards">
        {cards.map(({ label, val, color, dim }) => (
          <div className="at-stat-card" key={label} style={{ background: dim, borderColor: color + "30" }}>
            <div className="at-stat-card__val" style={{ color }}>{val ?? 0}</div>
            <div className="at-stat-card__label">{label}</div>
            <div className="at-stat-card__pct" style={{ color }}>{pct(val)}%</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="at-pipeline__bar">
          <div style={{ width: `${pct(stats.applied)}%`,     background: "#60a5fa" }} />
          <div style={{ width: `${pct(stats.shortlisted)}%`, background: "#34d399" }} />
          <div style={{ width: `${pct(stats.hired)}%`,       background: "#fbbf24" }} />
          <div style={{ width: `${pct(stats.rejected)}%`,    background: "#f87171" }} />
        </div>
      )}
    </div>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────
function FilterBar({ active, setActive, counts }) {
  const tabs = [
    { id: "all",         label: "All",         count: counts.total },
    { id: "applied",     label: "Applied",     count: counts.applied,     color: "#60a5fa" },
    { id: "shortlisted", label: "Shortlisted", count: counts.shortlisted, color: "#34d399" },
    { id: "hired",       label: "Hired",       count: counts.hired,       color: "#fbbf24" },
    { id: "rejected",    label: "Rejected",    count: counts.rejected,    color: "#f87171" },
  ];

  return (
    <div className="at-filter-bar">
      {tabs.map((t) => (
        <button
          key={t.id}
          className={`at-filter-tab${active === t.id ? " at-filter-tab--active" : ""}`}
          style={active === t.id && t.color ? {
            color: t.color,
            borderColor: t.color + "50",
            background: t.color + "14",
          } : {}}
          onClick={() => setActive(t.id)}
        >
          {t.label}
          {(t.count ?? 0) > 0 && <span className="at-filter-tab__badge">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

// ─── Application Card ─────────────────────────────────────────────────────────
function AppCard({ app, onClick, delay }) {
  const cfg  = STATUS[app.status] || STATUS.applied;
  const [lbg, lclr] = logoColor(app.job?.companyName);
  const score = app.matchScore ?? 0;
  const sc    = scoreColor(score);
  const circumference = 2 * Math.PI * 20; // r=20

  return (
    <div className="at-card" style={{ animationDelay: delay }} onClick={() => onClick(app)}>
      {/* Left accent bar */}
      <div className="at-card__accent" style={{ background: cfg.color }} />

      <div className="at-card__body">
        {/* Top row */}
        <div className="at-card__top">
          <div className="at-card__logo" style={{ background: lbg, color: lclr, boxShadow: `0 0 0 1px ${lclr}30` }}>
            {initials(app.job?.companyName)}
          </div>
          <div className="at-card__info">
            <div className="at-card__company">{app.job?.companyName || "Company"}</div>
            <div className="at-card__title">{app.job?.title || "Position"}</div>
          </div>

          {/* Score ring */}
          <div className="at-card__ring-wrap">
            <svg width="52" height="52" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4"/>
              <circle
                cx="26" cy="26" r="20"
                fill="none"
                stroke={sc}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
                transform="rotate(-90 26 26)"
              />
              <text x="26" y="26" textAnchor="middle" dominantBaseline="central"
                fill={sc} fontSize="10" fontWeight="700" fontFamily="'JetBrains Mono', monospace">
                {score}
              </text>
            </svg>
          </div>
        </div>

        {/* Meta */}
        <div className="at-card__meta">
          {app.job?.location && <span className="at-card__meta-pill"><Icons.MapPin />{app.job.location}</span>}
          {app.job?.jobType  && <span className="at-card__meta-pill">{app.job.jobType.replace("-", " ")}</span>}
          <span className="at-card__meta-pill at-card__meta-pill--time"><Icons.Clock />{timeAgo(app.createdAt)}</span>
        </div>

        {/* Mini pipeline */}
        <div className="at-card__pipeline">
          {STEPS.map((step, i) => {
            const done = cfg.step >= 0 && cfg.step >= i;
            const rejected = app.status === "rejected";
            return (
              <React.Fragment key={step}>
                <div className={`at-card__pip${done ? " at-card__pip--done" : ""}${rejected ? " at-card__pip--rejected" : ""}`}>
                  {done ? <Icons.Check /> : <span>{i + 1}</span>}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`at-card__pip-line${cfg.step > i && cfg.step >= 0 ? " at-card__pip-line--done" : ""}`} />
                )}
              </React.Fragment>
            );
          })}
          <span className="at-card__pip-status" style={{ color: cfg.color }}>{cfg.label}</span>
        </div>

        {/* Strength tags preview */}
        {app.strengths?.length > 0 && (
          <div className="at-card__tags">
            {app.strengths.slice(0, 2).map((s) => (
              <span className="at-card__tag" key={s}>{s}</span>
            ))}
            {app.strengths.length > 2 && (
              <span className="at-card__tag at-card__tag--more">+{app.strengths.length - 2}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="at-card__footer">
          <span className="at-card__footer-hint"><Icons.Spark />View AI feedback</span>
          <span className="at-card__footer-arrow"><Icons.ArrowUpRight /></span>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────
function DetailDrawer({ app, onClose }) {
  if (!app) return null;
  const cfg = STATUS[app.status] || STATUS.applied;
  const [lbg, lclr] = logoColor(app.job?.companyName);
  const scores = [
    { label: "Overall Match", val: app.matchScore },
    { label: "Skills",        val: app.skillsMatch },
    { label: "Experience",    val: app.experienceMatch },
    { label: "Keywords",      val: app.keywordsMatch },
  ];

  return (
    <>
      <div className="at-drawer-backdrop" onClick={onClose} />
      <div className="at-drawer">
        <button className="at-drawer__close" onClick={onClose}><Icons.X /></button>

        {/* Header */}
        <div className="at-drawer__head">
          <div className="at-drawer__logo" style={{ background: lbg, color: lclr, boxShadow: `0 0 0 1.5px ${lclr}35` }}>
            {initials(app.job?.companyName)}
          </div>
          <div>
            <div className="at-drawer__company">{app.job?.companyName}</div>
            <div className="at-drawer__title">{app.job?.title}</div>
            <div className="at-drawer__meta">
              {app.job?.location && <span><Icons.MapPin />{app.job.location}</span>}
              <span><Icons.Clock />{timeAgo(app.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div className="at-drawer__status" style={{ background: cfg.dim, color: cfg.color, borderColor: cfg.border }}>
          <cfg.icon />{cfg.label}
        </div>

        {/* Score breakdown */}
        <div className="at-drawer__section">
          <div className="at-drawer__label">AI Match Analysis</div>
          <div className="at-drawer__scores">
            {scores.map(({ label, val }) => (
              <div className="at-drawer__score-row" key={label}>
                <span className="at-drawer__score-name">{label}</span>
                <div className="at-drawer__score-track">
                  <div className="at-drawer__score-fill" style={{ width: `${val || 0}%`, background: scoreColor(val) }} />
                </div>
                <span className="at-drawer__score-val" style={{ color: scoreColor(val) }}>{val ?? 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Summary */}
        {app.aiSummary && (
          <div className="at-drawer__section">
            <div className="at-drawer__label">AI Recruiter Summary</div>
            <div className="at-drawer__text">{app.aiSummary}</div>
          </div>
        )}

        {/* Strengths */}
        {app.strengths?.length > 0 && (
          <div className="at-drawer__section">
            <div className="at-drawer__label">Strengths</div>
            <div className="at-drawer__tags at-drawer__tags--green">
              {app.strengths.map((s) => <span key={s}>{s}</span>)}
            </div>
          </div>
        )}

        {/* Weaknesses */}
        {app.weaknesses?.length > 0 && (
          <div className="at-drawer__section">
            <div className="at-drawer__label">Gaps</div>
            <div className="at-drawer__tags at-drawer__tags--red">
              {app.weaknesses.map((s) => <span key={s}>{s}</span>)}
            </div>
          </div>
        )}

        {/* Missing skills */}
        {app.missingSkills?.length > 0 && (
          <div className="at-drawer__section">
            <div className="at-drawer__label">Missing Skills</div>
            <div className="at-drawer__tags at-drawer__tags--amber">
              {app.missingSkills.map((s) => <span key={s}>{s}</span>)}
            </div>
          </div>
        )}

        {/* Rejection feedback */}
        {app.status === "rejected" && app.rejectionFeedback && (
          <div className="at-drawer__section at-drawer__section--rejection">
            <div className="at-drawer__label">Rejection Feedback</div>
            <div className="at-drawer__text">{app.rejectionFeedback}</div>
          </div>
        )}

        {/* Improvement tips */}
        {app.improvementTips?.length > 0 && (
          <div className="at-drawer__section">
            <div className="at-drawer__label">Improvement Tips</div>
            <ol className="at-drawer__tips">
              {app.improvementTips.map((tip, i) => <li key={i}>{tip}</li>)}
            </ol>
          </div>
        )}

        {/* Recruiter note */}
        {app.recruiterNote && (
          <div className="at-drawer__section at-drawer__section--note">
            <div className="at-drawer__label">Recruiter Note</div>
            <div className="at-drawer__text">{app.recruiterNote}</div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="at-skeleton">
      <div className="at-skeleton__accent" />
      <div className="at-skeleton__body">
        <div className="at-sk__top">
          <div className="at-sk__avatar" />
          <div className="at-sk__lines">
            <div className="at-sk__line at-sk__line--sm" />
            <div className="at-sk__line at-sk__line--md" />
          </div>
          <div className="at-sk__ring" />
        </div>
        <div className="at-sk__line at-sk__line--xs" style={{ marginTop: 10 }} />
        <div className="at-sk__pip-row">
          <div className="at-sk__dot" /><div className="at-sk__dot-line" />
          <div className="at-sk__dot" /><div className="at-sk__dot-line" />
          <div className="at-sk__dot" />
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ filtered, onBrowse }) {
  return (
    <div className="at-empty">
      <div className="at-empty__icon">
        {filtered ? <Icons.X /> : <Icons.Briefcase />}
      </div>
      <div className="at-empty__title">
        {filtered ? "No applications match this filter" : "No applications yet"}
      </div>
      <div className="at-empty__sub">
        {filtered
          ? "Switch to a different status tab above"
          : "Browse open positions and apply with your AI-analysed resume"}
      </div>
      {!filtered && (
        <button className="at-empty__cta" onClick={onBrowse}>
          Browse Jobs <Icons.ArrowRight />
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ApplicationTracker() {
  const navigate = useNavigate();
  const [user,         setUser]         = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState("all");
  const [selected,     setSelected]     = useState(null);
  const [sortBy,       setSortBy]       = useState("newest");

  // Fetch user for Sidebar
  useEffect(() => {
    ax.get("/api/auth/me")
      .then((r) => setUser(r.data.user ?? r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    ax.get("/api/applications/my")
      .then((r) => setApplications(r.data.applications || []))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total:       applications.length,
    applied:     applications.filter((a) => a.status === "applied").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    hired:       applications.filter((a) => a.status === "hired").length,
    rejected:    applications.filter((a) => a.status === "rejected").length,
  };

  const filtered = applications
    .filter((a) => filter === "all" || a.status === filter)
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "score")  return (b.matchScore || 0) - (a.matchScore || 0);
      return 0;
    });

  return (
    <div className="at-layout">
      {/* ── Shared Sidebar ─────────────────────────────────────── */}
      <Sidebar user={user} />

      {/* ── Main ───────────────────────────────────────────────── */}
      <div className="at-main">

        {/* Page header */}
        <div className="at-header">
          <div className="at-header__left">
            <h1 className="at-header__title">Applications</h1>
            <p className="at-header__sub">
              {loading
                ? "Loading…"
                : <><span className="at-header__count">{stats.total}</span> application{stats.total !== 1 ? "s" : ""} submitted</>}
            </p>
          </div>
          <div className="at-header__right">
            <select className="at-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="score">Highest match</option>
            </select>
            <button className="at-browse-btn" onClick={() => navigate("/jobs")}>
              Browse Jobs <Icons.ArrowRight />
            </button>
          </div>
        </div>

        {/* Pipeline */}
        {!loading && stats.total > 0 && <PipelineBanner stats={stats} />}

        {/* Filter bar */}
        <FilterBar active={filter} setActive={setFilter} counts={stats} />

        {/* Grid */}
        {loading ? (
          <div className="at-grid">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState filtered={filter !== "all"} onBrowse={() => navigate("/jobs")} />
        ) : (
          <div className="at-grid">
            {filtered.map((app, i) => (
              <AppCard key={app._id} app={app} onClick={setSelected} delay={`${i * 0.045}s`} />
            ))}
          </div>
        )}
      </div>

      {/* Drawer */}
      {selected && <DetailDrawer app={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}