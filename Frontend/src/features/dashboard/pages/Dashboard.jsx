import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../shared/Sidebar";
import "../styles/dashboard.scss";

const ax = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  ArrowUpRight: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>),
  Zap:          () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>),
  CheckCircle:  () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>),
  Clock:        () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>),
  XCircle:      () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>),
  MapPin:       () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>),
  Bell:         () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>),
  FileText:     () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>),
  Bot:          () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg>),
  Briefcase:    () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>),
  History:      () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 0 .5-4.5"/><polyline points="3 3 3 9 9 9"/></svg>),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const timeAgo = (date) => {
  if (!date) return "";
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
};

const scoreColorClass = (s) => (s >= 75 ? "score--high" : s >= 50 ? "score--mid" : "score--low");

const statusMeta = {
  applied:     { label: "Applied",     cls: "st--applied",     Icon: Icon.Clock },
  shortlisted: { label: "Shortlisted", cls: "st--shortlisted", Icon: Icon.CheckCircle },
  rejected:    { label: "Rejected",    cls: "st--rejected",    Icon: Icon.XCircle },
  hired:       { label: "Hired",       cls: "st--hired",       Icon: Icon.Zap },
};

const greetingByHour = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, tone, delay, onClick }) {
  return (
    <div className={`stat-card stat-card--${tone}`} style={{ animationDelay: delay }} onClick={onClick}>
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value ?? "—"}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
      <div className="stat-card__arrow"><Icon.ArrowUpRight /></div>
    </div>
  );
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 80 }) {
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const dash = ((score || 0) / 100) * circ;
  const color = score >= 75 ? "#16845B" : score >= 50 ? "#C27D1A" : "#D94B4B";
  return (
    <svg width={size} height={size} className="score-ring">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EAE8E2" strokeWidth="6"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ / 4} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)" }}/>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="15" fontWeight="700" fontFamily="inherit">
        {score ?? "—"}
      </text>
    </svg>
  );
}

// ─── Resume Card ──────────────────────────────────────────────────────────────
function ResumeCard({ resume, onNavigate }) {
  if (!resume) return (
    <div className="module-card module-card--empty" style={{ animationDelay: "0.15s" }}>
      <div className="module-card__empty-icon"><Icon.FileText /></div>
      <div className="module-card__empty-title">Your resume hasn't been analyzed yet.</div>
      <div className="module-card__empty-sub">Upload your resume and a job description to discover your strengths, skill gaps, and hiring insights.</div>
      <button className="module-card__cta" onClick={() => onNavigate("/resume-analyzer")}>Analyze Resume <Icon.ArrowUpRight /></button>
    </div>
  );

  const scores = [
    { label: "ATS",        val: resume.atsScore },
    { label: "Skills",     val: resume.skillsMatch },
    { label: "Experience", val: resume.experienceMatch },
    { label: "Keywords",   val: resume.keywordsMatch },
  ];

  return (
    <div className="module-card" style={{ animationDelay: "0.15s" }}>
      <div className="module-card__header">
        <div className="module-card__title">Latest Resume Analysis</div>
        <button className="module-card__link" onClick={() => onNavigate("/resume-analyzer")}>View Full Report <Icon.ArrowUpRight /></button>
      </div>
      <div className="resume-score-layout">
        <div className="resume-score-ring">
          <ScoreRing score={resume.overallScore} size={92} />
          <div className="resume-score-label">Overall Score</div>
        </div>
        <div className="resume-score-bars">
          {scores.map(({ label, val }) => (
            <div className="score-bar-row" key={label}>
              <span className="score-bar-label">{label}</span>
              <div className="score-bar-track">
                <div className="score-bar-fill" style={{ width: `${val||0}%`, background: val>=75?"#16845B":val>=50?"#C27D1A":"#D94B4B" }}/>
              </div>
              <span className={`score-bar-val ${scoreColorClass(val)}`}>{val ?? 0}</span>
            </div>
          ))}
        </div>
      </div>
      {resume.hiringOutlook?.verdict && (
        <div className="resume-verdict"><Icon.Zap /><span>{resume.hiringOutlook.verdict}</span></div>
      )}
    </div>
  );
}

// ─── Applications Card ────────────────────────────────────────────────────────
function ApplicationsCard({ applications, onNavigate }) {
  if (!applications?.length) return (
    <div className="module-card module-card--empty" style={{ animationDelay: "0.25s" }}>
      <div className="module-card__empty-icon"><Icon.Briefcase /></div>
      <div className="module-card__empty-title">No applications found</div>
      <div className="module-card__empty-sub">Browse open positions and apply with your AI-optimized resume profile</div>
      <button className="module-card__cta" onClick={() => onNavigate("/jobs")}>Browse Jobs <Icon.ArrowUpRight /></button>
    </div>
  );

  return (
    <div className="module-card" style={{ animationDelay: "0.25s" }}>
      <div className="module-card__header">
        <div className="module-card__title">Recent Applications</div>
        <button className="module-card__link" onClick={() => onNavigate("/applications")}>View All Applications <Icon.ArrowUpRight /></button>
      </div>
      <div className="app-list">
        {applications.slice(0, 5).map((app) => {
          const st = statusMeta[app.status] || statusMeta.applied;
          return (
            <div className="app-row" key={app._id}>
              <div className="app-row__left">
                <div className="app-row__title">{app.job?.title || "Position"}</div>
                <div className="app-row__meta">
                  <Icon.MapPin />{app.job?.companyName || "Company"}
                  <span className="app-row__dot" />
                  <Icon.Clock />{timeAgo(app.createdAt)}
                </div>
              </div>
              <div className="app-row__right">
                {app.matchScore > 0 && <span className={`app-score ${scoreColorClass(app.matchScore)}`}>{app.matchScore}%</span>}
                <span className={`app-status ${st.cls}`}><st.Icon />{st.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Interview Card ───────────────────────────────────────────────────────────
function InterviewCard({ reports, onNavigate }) {
  if (!reports?.length) return (
    <div className="module-card module-card--empty" style={{ animationDelay: "0.35s" }}>
      <div className="module-card__empty-icon"><Icon.Bot /></div>
      <div className="module-card__empty-title">Ready for your next interview?</div>
      <div className="module-card__empty-sub">Generate role-specific technical questions, behavioral questions, and AI-written model answers.</div>
      <button className="module-card__cta" onClick={() => onNavigate("/interview-prep")}>Start Interview Prep <Icon.ArrowUpRight /></button>
    </div>
  );

  const latest = reports[0];
  const avg = reports.length > 1
    ? Math.round(reports.reduce((s, r) => s + (r.matchScore || 0), 0) / reports.length)
    : null;

  return (
    <div className="module-card" style={{ animationDelay: "0.35s" }}>
      <div className="module-card__header">
        <div className="module-card__title">Interview Preparation</div>
        <button className="module-card__link" onClick={() => onNavigate("/interview-history")}>Prep History <Icon.ArrowUpRight /></button>
      </div>
      <div className="interview-latest">
        <div className="interview-latest__score">
          <ScoreRing score={latest.matchScore} size={68} />
          <div className="interview-latest__score-label">Match</div>
        </div>
        <div className="interview-latest__info">
          <div className="interview-latest__title">{latest.title || "Untitled Report"}</div>
          <div className="interview-latest__meta"><Icon.Clock /> {timeAgo(latest.createdAt)}</div>
          {avg && <div className="interview-latest__avg">Avg across {reports.length} sessions: <strong>{avg}%</strong></div>}
        </div>
      </div>
      <div className="interview-pills">
        <div className="interview-pill interview-pill--teal">{latest.technicalQuestions?.length || 0} tech Q&As</div>
        <div className="interview-pill interview-pill--amber">{latest.behavioralQuestions?.length || 0} behavioral</div>
        <div className="interview-pill interview-pill--blue">{latest.preparationPlan?.length || 0} day plan</div>
      </div>
      <button className="module-card__cta module-card__cta--outline" onClick={() => onNavigate("/interview-prep")}>
        Start New Preparation <Icon.ArrowUpRight />
      </button>
    </div>
  );
}

// ─── Skills Widget ────────────────────────────────────────────────────────────
function SkillsWidget({ user, resume }) {
  const skills  = user?.skills?.length ? user.skills : [];
  const missing = resume?.missingSkills?.slice(0, 5) || [];
  return (
    <div className="module-card module-card--compact" style={{ animationDelay: "0.45s" }}>
      <div className="module-card__header">
        <div className="module-card__title">Your Skills & Gaps</div>
      </div>
      {skills.length > 0 || missing.length > 0 ? (
        <div className="skills-cloud">
          {skills.map((s) => <span className="skill-tag skill-tag--have" key={s}>{s}</span>)}
          {missing.map((s) => <span className="skill-tag skill-tag--missing" key={s}>{s}</span>)}
        </div>
      ) : (
        <div className="skills-empty">Update your profile or analyze a resume to view your skill breakdown.</div>
      )}
      {(skills.length > 0 || missing.length > 0) && (
        <div className="skills-legend">
          <span className="legend-dot legend-dot--have" /> Your Skills &nbsp;&nbsp;
          <span className="legend-dot legend-dot--missing" /> Skills to Improve
        </div>
      )}
    </div>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────
function QuickActions({ onNavigate }) {
  const actions = [
    { label: "Analyze Resume",  sub: "Upload PDF + JD",      icon: <Icon.FileText />, path: "/resume-analyzer",    tone: "peach"  },
    { label: "Interview Prep",  sub: "AI interview questions", icon: <Icon.Bot />,      path: "/interview-prep",    tone: "lavender" },
    { label: "Browse Jobs",     sub: "Explore open roles",   icon: <Icon.Briefcase />, path: "/jobs",             tone: "blue"   },
    { label: "Prep History",    sub: "Previous reports",     icon: <Icon.History />,   path: "/interview-history", tone: "lime"   },
  ];
  return (
    <div className="quick-actions" style={{ animationDelay: "0.4s" }}>
      <div className="section-label">Quick Actions</div>
      <div className="qa-grid">
        {actions.map((a, i) => (
          <button key={a.path} className={`qa-card qa-card--${a.tone}`}
            style={{ animationDelay: `${0.4 + i * 0.05}s` }}
            onClick={() => onNavigate(a.path)}>
            <div className="qa-card__icon">{a.icon}</div>
            <div className="qa-card__content">
              <div className="qa-card__label">{a.label}</div>
              <div className="qa-card__sub">{a.sub}</div>
            </div>
            <div className="qa-card__arrow"><Icon.ArrowUpRight /></div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser]         = useState(null);
  const [resume, setResume]     = useState(null);
  const [applications, setApps] = useState([]);
  const [reports, setReports]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.allSettled([
      ax.get("/auth/me"),
      ax.get("/resume?limit=1"),
      ax.get("/applications/my"),
      ax.get("/interview"),
    ]).then(([u, r, a, i]) => {
      if (u.status === "fulfilled") setUser(u.value.data.user || u.value.data);
      if (r.status === "fulfilled") {
        const list = r.value.data.resumes || r.value.data.analyses || [];
        setResume(list[0] || null);
      }
      if (a.status === "fulfilled") setApps(a.value.data.applications || []);
      if (i.status === "fulfilled") setReports(i.value.data.reports || []);
    }).finally(() => setLoading(false));
  }, []);

  const appStats = {
    total:       applications.length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    avgScore:    applications.length
      ? Math.round(applications.reduce((s, a) => s + (a.matchScore || 0), 0) / applications.length)
      : null,
  };

  if (loading) return (
    <div className="db-loading">
      <div className="db-loading__spinner" />
      <div className="db-loading__text">Loading your dashboard...</div>
    </div>
  );

  return (
    <div className="db-layout">
      <Sidebar user={user} />

      <div className="db-main">
        <header className="db-topbar">
          <div className="db-topbar__left">
            <div className="db-greeting">
              <h1 className="db-greeting__text">{greetingByHour()}, <strong>{user?.username || "Parth"}</strong>.</h1>
              <span className="db-greeting__sub">Your career progress and AI-powered insights at a glance.</span>
            </div>
          </div>
          <div className="db-topbar__right">
            <button className="db-icon-btn" title="Notifications"><Icon.Bell /></button>
          </div>
        </header>

        <main className="db-body">
          <div className="stat-row">
            <StatCard label="Applications" value={appStats.total}
              sub="Total applications sent" tone="blue" delay="0s" onClick={() => navigate("/applications")} />
            <StatCard label="Shortlisted" value={appStats.shortlisted}
              sub="Recruiters noticed your profile" tone="lime" delay="0.05s" onClick={() => navigate("/applications")} />
            <StatCard label="Average Match Score"
              value={appStats.avgScore ? `${appStats.avgScore}%` : "—"}
              sub="Across submitted applications" tone="peach" delay="0.1s" onClick={() => navigate("/applications")} />
            <StatCard label="Interview Preparation" value={reports.length}
              sub="Your preparation sessions" tone="lavender" delay="0.15s" onClick={() => navigate("/interview-history")} />
          </div>

          <div className="db-grid">
            <div className="db-grid__left">
              <ResumeCard resume={resume} onNavigate={navigate} />
              <ApplicationsCard applications={applications} onNavigate={navigate} />
            </div>
            <div className="db-grid__right">
              <InterviewCard reports={reports} onNavigate={navigate} />
              <SkillsWidget user={user} resume={resume} />
              <QuickActions onNavigate={navigate} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}