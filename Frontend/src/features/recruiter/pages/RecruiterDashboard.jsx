import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HireBotLogo from "../../shared/Logo";
import "../styles/recruiter.scss";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ─── Icons ────────────────────────────────────────────────────────
const Icon = {
  Grid: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Briefcase: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
      <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
    </svg>
  ),
  Users: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  Settings: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  Bell: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  TrendUp: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Eye: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  LogOut: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Activity: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  Star: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  RefreshCw: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  XCircle: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  Clock: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Zap: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
};

// ─── Helpers ──────────────────────────────────────────────────────
const avatarColor = (str = "") => {
  const palette = ["#185FA5", "#7c3aed", "#1D9E75", "#BA7517", "#dc2626", "#0891b2", "#b45309"];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  return palette[Math.abs(h) % palette.length];
};

const initials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const daysAgo = (dateStr) => {
  const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  return d === 0 ? "Today" : d === 1 ? "Yesterday" : `${d}d ago`;
};

// ─── Skeleton ─────────────────────────────────────────────────────
function Skeleton({ h = 16, w = "100%", r = 6 }) {
  return <div className="rd-skeleton" style={{ height: h, width: w, borderRadius: r }} />;
}

// ─── Sidebar ──────────────────────────────────────────────────────
function Sidebar({ active, setActive, user, onLogout, totalApplicants, totalJobs }) {
  const nav = [
    { id: "dashboard", label: "Overview", icon: <Icon.Grid /> },
    { id: "jobs", label: "Jobs", icon: <Icon.Briefcase />, badge: totalJobs || null },
    { id: "applicants", label: "Applicants", icon: <Icon.Users />, badge: totalApplicants || null },
    { id: "activity", label: "Analytics", icon: <Icon.Activity /> },
    // { id: "settings", label: "Settings", icon: <Icon.Settings /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <HireBotLogo size={28} textSize={16} />
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Workspace</div>
        {nav.map((n) => (
          <button
            key={n.id}
            className={`nav-item ${active === n.id ? "active" : ""}`}
            onClick={() => setActive(n.id)}
          >
            <span className="nav-icon">{n.icon}</span>
            <span className="nav-label">{n.label}</span>
            {n.badge ? <span className="nav-badge">{n.badge > 99 ? "99+" : n.badge}</span> : null}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="recruiter-profile">
          <div
            className="avatar"
            style={{
              background: `${avatarColor(user?.username || "R")}18`,
              color: avatarColor(user?.username || "R"),
              border: `1.5px solid ${avatarColor(user?.username || "R")}30`,
            }}
          >
            {initials(user?.companyName || user?.username || "HR")}
          </div>
          <div className="profile-info">
            <div className="profile-name">{user?.companyName || user?.username || "Recruiter"}</div>
            <div className="profile-role">Recruiter</div>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          <Icon.LogOut />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────
function StatCard({ label, value, delta, deltaPositive, icon, accentColor, loading }) {
  return (
    <div className="stat-card" style={{ "--accent-rgb": accentColor }}>
      <div className="stat-card__inner">
        <div className="stat-header">
          <span className="stat-label">{label}</span>
          <div className="stat-icon-wrap" style={{ background: `${accentColor}15` }}>
            <span style={{ color: accentColor }}>{icon}</span>
          </div>
        </div>
        <div className="stat-value">
          {loading ? <Skeleton h={32} w={70} r={6} /> : value}
        </div>
        <div className={`stat-delta ${deltaPositive ? "positive" : "neutral"}`}>
          {!loading && deltaPositive && <Icon.TrendUp />}
          {loading ? <Skeleton h={12} w={90} r={4} /> : delta}
        </div>
      </div>
      <div className="stat-accent-bar" style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />
    </div>
  );
}

function StatsRow({ stats, loading }) {
  return (
    <div className="stats-row">
      <StatCard label="Total applicants" value={stats?.totalApplicants ?? "—"}
        delta={stats?.applicantsThisWeek != null ? `+${stats.applicantsThisWeek} this week` : "No data yet"}
        deltaPositive={stats?.applicantsThisWeek > 0}
        icon={<Icon.Users />} accentColor="#3b82f6" loading={loading} />
      <StatCard label="Shortlisted" value={stats?.shortlisted ?? "—"}
        delta={stats?.shortlistedThisWeek != null ? `+${stats.shortlistedThisWeek} this week` : "No data yet"}
        deltaPositive={stats?.shortlistedThisWeek > 0}
        icon={<Icon.Star />} accentColor="#10b981" loading={loading} />
      <StatCard label="Active jobs" value={stats?.activeJobs ?? "—"}
        delta={stats?.pausedJobs != null ? `${stats.pausedJobs} paused` : "All active"}
        deltaPositive={false} icon={<Icon.Briefcase />} accentColor="#f59e0b" loading={loading} />
      <StatCard label="Avg. match" value={stats?.avgMatchScore != null ? `${Math.round(stats.avgMatchScore)}%` : "—"}
        delta={stats?.avgMatchScore != null ? (stats.avgMatchScore >= 70 ? "Strong candidate pool" : "Room to improve") : "No scores yet"}
        deltaPositive={stats?.avgMatchScore >= 70}
        icon={<Icon.Activity />} accentColor="#8b5cf6" loading={loading} />
    </div>
  );
}

// ─── Jobs Panel ───────────────────────────────────────────────────
function JobsPanel({ jobs, loading, error, onPost, onViewApplicants, onRefresh }) {
  return (
    <div className="panel-card">
      <div className="panel-card__header">
        <div>
          <h3 className="panel-card__title">Job listings</h3>
          <p className="panel-card__sub">{jobs.length} active posting{jobs.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="panel-card__actions">
          <button className="icon-action-btn" onClick={onRefresh} title="Refresh"><Icon.RefreshCw /></button>
          <button className="primary-btn small" onClick={onPost}><Icon.Plus /> New job</button>
        </div>
      </div>

      {error && <div className="error-strip">Failed to load. <button onClick={onRefresh}>Retry</button></div>}

      <div className="jobs-list">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div className="job-row" key={i}>
                <Skeleton h={36} w={36} r={10} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <Skeleton h={13} w="55%" /><Skeleton h={11} w="38%" />
                </div>
                <Skeleton h={24} w={64} r={20} />
              </div>
            ))
          : jobs.length === 0
          ? (<div className="list-empty">No listings yet. <button className="link-btn" onClick={onPost}>Post your first →</button></div>)
          : jobs.slice(0, 6).map((job) => {
              const color = avatarColor(job.title);
              const inits = (job.title || "JO").split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
              return (
                <div className="job-row" key={job._id}>
                  <div className="job-logo" style={{ background: `${color}15`, color }}>
                    {inits}
                  </div>
                  <div className="job-row__info">
                    <div className="job-row__title">{job.title}</div>
                    <div className="job-row__meta">{job.location} · {job.jobType} · {daysAgo(job.createdAt)}</div>
                  </div>
                  <span className={`status-pill ${job.isActive ? "active" : "paused"}`}>
                    {job.isActive ? "Active" : "Paused"}
                  </span>
                  <button className="ghost-btn" onClick={() => onViewApplicants(job._id)}>
                    <Icon.Eye /> View
                  </button>
                </div>
              );
            })}
      </div>
    </div>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────
function QuickActions({ onPost, onNav }) {
  const actions = [
    { icon: <Icon.Plus />, label: "Post a job", color: "#3b82f6", bg: "#3b82f610", onClick: onPost },
    { icon: <Icon.Users />, label: "View applicants", color: "#10b981", bg: "#10b98110", onClick: () => onNav("applicants") },
    { icon: <Icon.Activity />, label: "Analytics", color: "#f59e0b", bg: "#f59e0b10", onClick: () => onNav("activity") },
    { icon: <Icon.Settings />, label: "Settings", color: "#8b5cf6", bg: "#8b5cf610", onClick: () => onNav("settings") },
  ];
  return (
    <div className="quick-actions-grid">
      {actions.map((a) => (
        <button key={a.label} className="qa-card" onClick={a.onClick}>
          <div className="qa-icon" style={{ background: a.bg, color: a.color }}>{a.icon}</div>
          <span className="qa-label">{a.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Top Jobs Hint ────────────────────────────────────────────────
function TopJobsHint({ jobs, navigate }) {
  if (!jobs.length) return null;
  return (
    <div className="panel-card">
      <div className="panel-card__header">
        <div>
          <h3 className="panel-card__title">Quick access</h3>
          <p className="panel-card__sub">Click to rank applicants</p>
        </div>
      </div>
      <div className="hint-list">
        {jobs.slice(0, 5).map((job) => {
          const color = avatarColor(job.title);
          const inits = (job.title || "JO").split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
          return (
            <div key={job._id} className="hint-row" onClick={() => navigate(`/recruiter/applicants/${job._id}`)}>
              <div className="job-logo" style={{ background: `${color}15`, color }}>{inits}</div>
              <div className="job-row__info">
                <div className="job-row__title">{job.title}</div>
                <div className="job-row__meta">{job.location}</div>
              </div>
              <span className="hint-arrow"><Icon.ArrowRight /></span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PANEL: My Jobs (full view) ───────────────────────────────────
function MyJobsPanel({ jobs, loading, error, onPost, onViewApplicants, onRefresh }) {
  return (
    <div className="full-panel">
      <div className="full-panel__hero">
        <div>
          <p className="full-panel__eyebrow">Manage</p>
          <h2 className="full-panel__title">My job listings</h2>
          <p className="full-panel__sub">{jobs.length} posting{jobs.length !== 1 ? "s" : ""} total</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="icon-action-btn" onClick={onRefresh}><Icon.RefreshCw /></button>
          {/* <button className="primary-btn" onClick={onPost}><Icon.Plus /> Post job</button> */}
        </div>
      </div>
      {error && <div className="error-strip">Failed to load. <button onClick={onRefresh}>Retry</button></div>}
      <div className="jobs-full-grid">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div className="job-card-full" key={i}>
                <Skeleton h={44} w={44} r={12} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  <Skeleton h={15} w="50%" /><Skeleton h={12} w="35%" />
                </div>
              </div>
            ))
          : jobs.length === 0
          ? (<div className="list-empty">No listings yet. <button className="link-btn" onClick={onPost}>Post your first →</button></div>)
          : jobs.map((job) => {
              const color = avatarColor(job.title);
              const inits = (job.title || "JO").split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
              return (
                <div className="job-card-full" key={job._id}>
                  <div className="job-logo large" style={{ background: `${color}15`, color }}>{inits}</div>
                  <div className="job-card-full__body">
                    <div className="job-card-full__top">
                      <div>
                        <div className="job-row__title">{job.title}</div>
                        <div className="job-row__meta">{job.companyName} · {job.location} · {job.jobType} · {daysAgo(job.createdAt)}</div>
                      </div>
                      <span className={`status-pill ${job.isActive ? "active" : "paused"}`}>
                        {job.isActive ? "Active" : "Paused"}
                      </span>
                    </div>
                    {job.salaryMin && job.salaryMax && (
                      <div className="job-salary">₹{job.salaryMin}–{job.salaryMax} LPA</div>
                    )}
                    {job.requiredSkills?.length > 0 && (
                      <div className="skill-tags">
                        {job.requiredSkills.slice(0, 4).map((s) => <span key={s} className="skill-tag">{s}</span>)}
                        {job.requiredSkills.length > 4 && <span className="skill-tag more">+{job.requiredSkills.length - 4}</span>}
                      </div>
                    )}
                  </div>
                  <button className="ghost-btn" onClick={() => onViewApplicants(job._id)}>
                    <Icon.Eye /> Applicants
                  </button>
                </div>
              );
            })}
      </div>
    </div>
  );
}

// ─── PANEL: Applicants entry ──────────────────────────────────────
function ApplicantsPanel({ jobs, loading, onViewApplicants }) {
  return (
    <div className="full-panel">
      <div className="full-panel__hero">
        <div>
          <p className="full-panel__eyebrow">Review</p>
          <h2 className="full-panel__title">Applicants</h2>
          <p className="full-panel__sub">Select a listing to view ranked candidates</p>
        </div>
      </div>
      <div className="jobs-full-grid">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div className="job-card-full" key={i}>
                <Skeleton h={44} w={44} r={12} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  <Skeleton h={15} w="50%" /><Skeleton h={12} w="35%" />
                </div>
              </div>
            ))
          : jobs.length === 0
          ? (<div className="list-empty">No jobs posted yet.</div>)
          : jobs.map((job) => {
              const color = avatarColor(job.title);
              const inits = (job.title || "JO").split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
              return (
                <div className="job-card-full clickable" key={job._id} onClick={() => onViewApplicants(job._id)}>
                  <div className="job-logo large" style={{ background: `${color}15`, color }}>{inits}</div>
                  <div className="job-card-full__body">
                    <div className="job-row__title">{job.title}</div>
                    <div className="job-row__meta">{job.location} · {job.jobType} · {daysAgo(job.createdAt)}</div>
                  </div>
                  <span className="hint-arrow"><Icon.ArrowRight /></span>
                </div>
              );
            })}
      </div>
    </div>
  );
}

// ─── PANEL: Activity ──────────────────────────────────────────────
function ActivityPanel({ stats, jobs, loading }) {
  const total = stats?.totalApplicants || 1;
  const funnelData = [
    { label: "Received", value: stats?.totalApplicants ?? 0, color: "#3b82f6" },
    { label: "Shortlisted", value: stats?.shortlisted ?? 0, color: "#10b981" },
    { label: "Hired", value: stats?.hired ?? 0, color: "#8b5cf6" },
    { label: "Rejected", value: stats?.rejected ?? 0, color: "#ef4444" },
  ];

  return (
    <div className="full-panel">
      <div className="full-panel__hero">
        <div>
          <p className="full-panel__eyebrow">Insights</p>
          <h2 className="full-panel__title">Hiring analytics</h2>
          <p className="full-panel__sub">Pipeline breakdown across all listings</p>
        </div>
      </div>

      <div className="funnel-grid">
        {funnelData.map((f) => {
          const pct = Math.round((f.value / total) * 100);
          return (
            <div className="funnel-card" key={f.label}>
              <div className="funnel-card__label">{f.label}</div>
              <div className="funnel-card__value" style={{ color: f.color }}>
                {loading ? "—" : f.value}
              </div>
              <div className="funnel-card__track">
                <div className="funnel-card__fill" style={{ width: loading ? "0%" : `${Math.min(pct, 100)}%`, background: f.color }} />
              </div>
              <div className="funnel-card__pct">{loading ? "" : `${pct}% of total`}</div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h4 className="section-label">Recent postings</h4>
        <div className="timeline">
          {jobs.length === 0 && !loading && <div className="list-empty">No postings yet.</div>}
          {jobs.slice(0, 6).map((job, i) => {
            const color = avatarColor(job.title);
            return (
              <div className="timeline-item" key={job._id}>
                <div className="timeline-dot" style={{ background: color }} />
                {i < Math.min(jobs.length, 6) - 1 && <div className="timeline-connector" />}
                <div className="timeline-content">
                  <div className="timeline-title">{job.title}</div>
                  <div className="timeline-meta">
                    <Icon.Clock /> {daysAgo(job.createdAt)} · {job.location} ·
                    <span style={{ color: job.isActive ? "#10b981" : "#f59e0b", marginLeft: 4 }}>
                      {job.isActive ? "Active" : "Paused"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────
export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [errorJobs, setErrorJobs] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/auth/me`, { withCredentials: true });
      setUser(data.user ?? data);
    } catch { }
  }, []);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const { data } = await axios.get(`${API}/api/applications/recruiter/stats`, { withCredentials: true });
      setStats(data);
    } catch { setStats(null); }
    finally { setLoadingStats(false); }
  }, []);

  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true);
    setErrorJobs(false);
    try {
      const { data } = await axios.get(`${API}/api/jobs/recruiter/my-jobs`, { withCredentials: true });
      setJobs(Array.isArray(data) ? data : data.jobs ?? []);
    } catch { setErrorJobs(true); }
    finally { setLoadingJobs(false); }
  }, []);

  useEffect(() => {
    fetchUser(); fetchStats(); fetchJobs();
  }, [fetchUser, fetchStats, fetchJobs]);

  const handleNav = (id) => {
    if (id === "settings") { navigate("/settings"); return; }
    setActiveNav(id);
  };

  const handleLogout = async () => {
    try { await axios.get(`${API}/api/auth/logout`, { withCredentials: true }); }
    finally { navigate("/login"); }
  };

  const handlePostJob = () => navigate("/recruiter/post-job");
  const handleViewApplicants = (jobId) => navigate(`/recruiter/applicants/${jobId}`);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long",
  });

  const renderPanel = () => {
    switch (activeNav) {
      case "jobs":
        return <MyJobsPanel jobs={jobs} loading={loadingJobs} error={errorJobs}
          onPost={handlePostJob} onViewApplicants={handleViewApplicants} onRefresh={fetchJobs} />;
      case "applicants":
        return <ApplicantsPanel jobs={jobs} loading={loadingJobs} onViewApplicants={handleViewApplicants} />;
      case "activity":
        return <ActivityPanel stats={stats} jobs={jobs} loading={loadingStats || loadingJobs} />;
      case "dashboard":
      default:
        return (
          <>
            <StatsRow stats={stats} loading={loadingStats} />
            <div className="dashboard-grid">
              <div className="dashboard-main">
                <JobsPanel jobs={jobs} loading={loadingJobs} error={errorJobs}
                  onPost={handlePostJob} onViewApplicants={handleViewApplicants} onRefresh={fetchJobs} />
              </div>
              <div className="dashboard-side">
                <div className="panel-card qa-panel">
                  <div className="panel-card__header">
                    <div>
                      <h3 className="panel-card__title">Quick actions</h3>
                    </div>
                  </div>
                  <QuickActions onPost={handlePostJob} onNav={handleNav} />
                </div>
                <TopJobsHint jobs={jobs} navigate={navigate} />
              </div>
            </div>
          </>
        );
    }
  };

  const navLabels = {
    dashboard: "Overview",
    jobs: "Job listings",
    applicants: "Applicants",
    activity: "Analytics",
  };

  return (
    <div className="recruiter-layout">
      <Sidebar
        active={activeNav}
        setActive={handleNav}
        user={user}
        onLogout={handleLogout}
        totalApplicants={stats?.totalApplicants}
        totalJobs={jobs.length}
      />

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <div className="page-title">{navLabels[activeNav] || activeNav}</div>
            <div className="page-date">{today}</div>
          </div>
          <div className="topbar-right">
            <button className="icon-action-btn"><Icon.Bell /></button>
            <button className="primary-btn" onClick={handlePostJob}>
              <Icon.Plus /> Post job
            </button>
          </div>
        </header>

        <main className="page-body">
          {renderPanel()}
        </main>
      </div>
    </div>
  );
}