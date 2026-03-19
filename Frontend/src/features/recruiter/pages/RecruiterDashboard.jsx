import React, { useState } from "react";
import "../styles/recruiter.scss";

// ─── Icons ───────────────────────────────────────────────────────
const Icon = {
  Grid: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Briefcase: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
    </svg>
  ),
  Users: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  Settings: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  Bell: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  Search: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  TrendUp: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  TrendDown: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
    </svg>
  ),
  Edit: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Trash: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
    </svg>
  ),
  Eye: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  LogOut: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Activity: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  Star: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
};

// ─── Mock Data ────────────────────────────────────────────────────
const JOBS = [
  { id: 1, title: "Senior Frontend Developer", location: "Remote", type: "Full-time", applicants: 48, status: "active",  postedDays: 3,  color: "#185FA5", initials: "FE" },
  { id: 2, title: "Product Designer",          location: "Bangalore",type: "Full-time",applicants: 31, status: "active",  postedDays: 7,  color: "#7c3aed", initials: "PD" },
  { id: 3, title: "Backend Engineer (Node.js)",location: "Remote", type: "Contract", applicants: 22, status: "paused",  postedDays: 12, color: "#1D9E75", initials: "BE" },
  { id: 4, title: "Data Analyst",              location: "Mumbai",  type: "Full-time",applicants: 15, status: "active",  postedDays: 2,  color: "#BA7517", initials: "DA" },
  { id: 5, title: "DevOps Engineer",           location: "Remote", type: "Full-time",applicants: 9,  status: "draft",   postedDays: 0,  color: "#dc2626", initials: "DO" },
];

const CANDIDATES = [
  { id: 1, name: "Priya Sharma",   role: "Senior Frontend Developer", score: 91, status: "shortlisted", initials: "PS", color: "#185FA5", bg: "rgba(24,95,165,0.15)" },
  { id: 2, name: "Arjun Mehta",    role: "Senior Frontend Developer", score: 84, status: "new",         initials: "AM", color: "#7c3aed", bg: "rgba(124,58,237,0.15)" },
  { id: 3, name: "Sneha Kapoor",   role: "Product Designer",          score: 78, status: "new",         initials: "SK", color: "#1D9E75", bg: "rgba(29,158,117,0.15)" },
  { id: 4, name: "Rahul Verma",    role: "Backend Engineer",          score: 72, status: "new",         initials: "RV", color: "#BA7517", bg: "rgba(186,117,23,0.15)" },
  { id: 5, name: "Divya Nair",     role: "Data Analyst",              score: 65, status: "rejected",    initials: "DN", color: "#6b7280", bg: "rgba(107,114,128,0.15)" },
];

const ACTIVITY = [
  { dot: "blue",  text: <><strong>Priya Sharma</strong> was shortlisted for Senior Frontend Developer</>,  time: "2 min ago" },
  { dot: "green", text: <><strong>48 new applications</strong> received for Senior Frontend Developer</>,   time: "1 hr ago" },
  { dot: "amber", text: <>Job post <strong>Backend Engineer</strong> was paused</>,                         time: "3 hr ago" },
  { dot: "blue",  text: <><strong>Product Designer</strong> listing went live</>,                           time: "Yesterday" },
  { dot: "red",   text: <><strong>Divya Nair</strong> application marked as rejected</>,                    time: "Yesterday" },
];

// ─── Score color helper ───────────────────────────────────────────
const scoreClass = (s) => s >= 80 ? "high" : s >= 65 ? "medium" : "low";
const scoreBarColor = (s) => s >= 80 ? "#34d399" : s >= 65 ? "#fbbf24" : "#f87171";

// ─── Post Job Modal ───────────────────────────────────────────────
function PostJobModal({ onClose }) {
  const [form, setForm] = useState({ title: "", location: "", type: "Full-time", salary: "", experience: "", description: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>Post a new job</h2>
          <button className="modal-close" onClick={onClose}><Icon.X /></button>
        </div>

        <div className="form-field">
          <label>Job title</label>
          <input value={form.title} onChange={set("title")} placeholder="e.g. Senior React Developer" />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Location</label>
            <input value={form.location} onChange={set("location")} placeholder="Remote / City" />
          </div>
          <div className="form-field">
            <label>Job type</label>
            <select value={form.type} onChange={set("type")}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Salary range</label>
            <input value={form.salary} onChange={set("salary")} placeholder="e.g. ₹12–18 LPA" />
          </div>
          <div className="form-field">
            <label>Experience level</label>
            <select value={form.experience} onChange={set("experience")}>
              <option value="">Select…</option>
              <option>Fresher</option>
              <option>1–3 years</option>
              <option>3–5 years</option>
              <option>5+ years</option>
            </select>
          </div>
        </div>

        <div className="form-field">
          <label>Job description</label>
          <textarea value={form.description} onChange={set("description")} placeholder="Describe the role, responsibilities, and requirements…" />
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-confirm" onClick={onClose}>Post Job</button>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────
function Sidebar({ active, setActive }) {
  const nav = [
    { id: "dashboard",   label: "Dashboard",   icon: <Icon.Grid /> },
    { id: "jobs",        label: "My Jobs",     icon: <Icon.Briefcase />, badge: 5 },
    { id: "applicants",  label: "Applicants",  icon: <Icon.Users />, badge: 48 },
    { id: "activity",    label: "Activity",    icon: <Icon.Activity /> },
    { id: "settings",    label: "Settings",    icon: <Icon.Settings /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">H</div>
        <span>HireBot</span>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Menu</div>
        {nav.map((n) => (
          <button
            key={n.id}
            className={`nav-item ${active === n.id ? "active" : ""}`}
            onClick={() => setActive(n.id)}
          >
            {n.icon}
            {n.label}
            {n.badge && <span className="nav-badge">{n.badge}</span>}
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="recruiter-profile">
          <div className="avatar">TM</div>
          <div className="profile-info">
            <div className="profile-name">TechMatrix HR</div>
            <div className="profile-role">Recruiter</div>
          </div>
        </div>
        <button className="nav-item" style={{ color: "#f87171", marginTop: 4 }}>
          <Icon.LogOut /> Log out
        </button>
      </div>
    </aside>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────
function StatCard({ label, value, delta, deltaDir, icon, iconBg }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <div className="stat-icon" style={{ background: iconBg }}>{icon}</div>
      </div>
      <div className="stat-value">{value}</div>
      <div className={`stat-delta ${deltaDir}`}>
        {deltaDir === "up" && <Icon.TrendUp />}
        {deltaDir === "down" && <Icon.TrendDown />}
        {delta}
      </div>
    </div>
  );
}

// ─── Jobs Panel ───────────────────────────────────────────────────
function JobsPanel({ onPost }) {
  return (
    <div>
      <div className="section-header">
        <span className="section-title">Active job listings</span>
        <button className="section-action" onClick={onPost}>+ Post new</button>
      </div>
      <div className="jobs-panel">
        {JOBS.map((job) => (
          <div className="job-item" key={job.id}>
            <div className="job-logo" style={{ background: job.color + "22", color: job.color }}>
              {job.initials}
            </div>
            <div className="job-info">
              <div className="job-title">{job.title}</div>
              <div className="job-meta">{job.location} · {job.type} · {job.postedDays === 0 ? "Draft" : `${job.postedDays}d ago`}</div>
            </div>
            <div className="job-right">
              <span className={`badge badge-${job.status}`}>{job.status}</span>
              <span className="applicant-count">{job.applicants} applicants</span>
            </div>
            <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
              <button style={{ background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "4px 7px", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center" }}>
                <Icon.Edit />
              </button>
              <button style={{ background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "4px 7px", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center" }}>
                <Icon.Trash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Candidates Panel ─────────────────────────────────────────────
function CandidatesPanel() {
  const [candidates, setCandidates] = useState(CANDIDATES);

  const shortlist = (id) =>
    setCandidates((prev) => prev.map((c) => c.id === id ? { ...c, status: "shortlisted" } : c));
  const reject = (id) =>
    setCandidates((prev) => prev.map((c) => c.id === id ? { ...c, status: "rejected" } : c));

  return (
    <div>
      <div className="section-header">
        <span className="section-title">Top candidates</span>
        <button className="section-action">View all</button>
      </div>
      <div className="candidates-panel">
        {candidates.map((c) => (
          <div className="candidate-item" key={c.id}>
            <div className="c-avatar" style={{ background: c.bg, color: c.color }}>{c.initials}</div>
            <div className="c-info">
              <div className="c-name">{c.name}</div>
              <div className="c-role">{c.role}</div>
            </div>
            <div className="c-score">
              <span className={`score-num ${scoreClass(c.score)}`}>{c.score}</span>
              <div className="mini-bar">
                <div className="mini-bar-fill" style={{ width: `${c.score}%`, background: scoreBarColor(c.score) }} />
              </div>
            </div>
            <div className="c-actions">
              {c.status === "new" && (
                <>
                  <button className="shortlist" onClick={() => shortlist(c.id)}>Shortlist</button>
                  <button className="reject"    onClick={() => reject(c.id)}>Reject</button>
                </>
              )}
              {c.status === "shortlisted" && <span className="badge badge-shortlisted">Shortlisted</span>}
              {c.status === "rejected"    && <span className="badge badge-rejected">Rejected</span>}
              <button style={{ background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "4px 7px", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center" }}>
                <Icon.Eye />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Activity Feed ────────────────────────────────────────────────
function ActivityFeed() {
  return (
    <div>
      <div className="section-header">
        <span className="section-title">Recent activity</span>
      </div>
      <div className="activity-feed">
        {ACTIVITY.map((a, i) => (
          <div className="activity-item" key={i}>
            <div className={`activity-dot ${a.dot}`} />
            <div>
              <div className="activity-text">{a.text}</div>
              <div className="activity-time">{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────
function QuickActions({ onPost }) {
  const actions = [
    { icon: <Icon.Plus />, iconBg: "rgba(24,95,165,0.15)", iconColor: "#93c5fd", label: "Post a job",      desc: "Create a new listing", onClick: onPost },
    { icon: <Icon.Users />, iconBg: "rgba(29,158,117,0.15)", iconColor: "#34d399", label: "View applicants", desc: "Browse all candidates" },
    { icon: <Icon.Activity />, iconBg: "rgba(186,117,23,0.15)", iconColor: "#fbbf24", label: "Analytics",       desc: "Hiring funnel stats" },
    { icon: <Icon.Settings />, iconBg: "rgba(107,114,128,0.15)", iconColor: "#9ca3af", label: "Settings",        desc: "Company & billing" },
  ];

  return (
    <div>
      <div className="section-header">
        <span className="section-title">Quick actions</span>
      </div>
      <div className="quick-actions">
        {actions.map((a) => (
          <div className="qa-card" key={a.label} onClick={a.onClick}>
            <div className="qa-icon" style={{ background: a.iconBg, color: a.iconColor }}>{a.icon}</div>
            <div className="qa-label">{a.label}</div>
            <div className="qa-desc">{a.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────
export default function RecruiterDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="recruiter-layout">
      <Sidebar active={activeNav} setActive={setActiveNav} />

      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="page-title">Recruiter Dashboard</div>
            <div className="page-subtitle">Wednesday, 18 March 2026</div>
          </div>
          <div className="topbar-right">
            <div className="icon-btn">
              <Icon.Search />
            </div>
            <div className="icon-btn">
              <Icon.Bell />
              <span className="notif-dot" />
            </div>
            <button className="btn-post-job" onClick={() => setShowModal(true)}>
              <Icon.Plus /> Post Job
            </button>
          </div>
        </header>

        {/* Body */}
        <main className="page-body">

          {/* Stat cards */}
          <div className="stats-row">
            <StatCard
              label="Total applicants"
              value="125"
              delta="+18 this week"
              deltaDir="up"
              icon={<Icon.Users />}
              iconBg="rgba(24,95,165,0.15)"
            />
            <StatCard
              label="Shortlisted"
              value="34"
              delta="+6 this week"
              deltaDir="up"
              icon={<Icon.Star />}
              iconBg="rgba(29,158,117,0.15)"
            />
            <StatCard
              label="Active jobs"
              value="4"
              delta="1 paused, 1 draft"
              deltaDir="neutral"
              icon={<Icon.Briefcase />}
              iconBg="rgba(186,117,23,0.15)"
            />
            <StatCard
              label="Avg. match score"
              value="76"
              delta="+4 vs last month"
              deltaDir="up"
              icon={<Icon.Activity />}
              iconBg="rgba(124,58,237,0.15)"
            />
          </div>

          {/* Quick actions */}
          <QuickActions onPost={() => setShowModal(true)} />

          {/* Two-col: Jobs + Candidates */}
          <div className="two-col">
            <JobsPanel onPost={() => setShowModal(true)} />
            <CandidatesPanel />
          </div>

          {/* Activity feed */}
          <ActivityFeed />

        </main>
      </div>

      {/* Post Job Modal */}
      {showModal && <PostJobModal onClose={() => setShowModal(false)} />}
    </div>
  );
}