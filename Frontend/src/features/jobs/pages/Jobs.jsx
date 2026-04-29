import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../shared/Sidebar";
import "../styles/jobs.scss";
import { getAllJobs, getRecommendedJobs, applyToJob } from "../services/jobs.api";

const ax = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

// ─── Icons ────────────────────────────────────────────────────────────────────
const SearchIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const FilterIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const MapPinIcon    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const BriefcaseIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>;
const ClockIcon     = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const SparkIcon     = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>;
const ArrowIcon     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>;
const ChevronLeft   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevronRight  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const XIcon         = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const UploadIcon    = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const CheckIcon     = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const BotIcon       = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>;
const TrendingIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)     return "just now";
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
};

const salaryLabel = (min, max) => {
  const a = Number(min) || 0;
  const b = Number(max) || 0;
  if (a <= 0 && b <= 0) return null;
  const fmt = (n) =>
    n >= 100000
      ? `₹${(n / 100000).toFixed(1).replace(/\.0$/, "")}L`
      : `₹${(n / 1000).toFixed(0)}K`;
  if (a > 0 && b > 0) return `${fmt(a)} – ${fmt(b)}`;
  if (a > 0) return `${fmt(a)}+`;
  return `up to ${fmt(b)}`;
};

const initials = (company) =>
  (company || "HB").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

const LOGO_COLORS = [
  { bg: "rgba(24,95,165,0.18)",  color: "#60a5fa", ring: "rgba(24,95,165,0.35)" },
  { bg: "rgba(29,158,117,0.18)", color: "#34d399", ring: "rgba(29,158,117,0.35)" },
  { bg: "rgba(124,58,237,0.18)", color: "#a78bfa", ring: "rgba(124,58,237,0.35)" },
  { bg: "rgba(186,117,23,0.18)", color: "#fbbf24", ring: "rgba(186,117,23,0.35)" },
  { bg: "rgba(220,38,38,0.14)",  color: "#f87171", ring: "rgba(220,38,38,0.30)" },
  { bg: "rgba(236,72,153,0.14)", color: "#f472b6", ring: "rgba(236,72,153,0.30)" },
];

const logoColor = (str) => {
  let h = 0;
  for (let i = 0; i < (str || "").length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return LOGO_COLORS[Math.abs(h) % LOGO_COLORS.length];
};

const scoreColor = (s) => {
  if (s >= 80) return { text: "#34d399", bg: "rgba(29,158,117,0.14)", bar: "#34d399", glow: "rgba(29,158,117,0.3)" };
  if (s >= 60) return { text: "#fbbf24", bg: "rgba(186,117,23,0.14)",  bar: "#fbbf24", glow: "rgba(186,117,23,0.3)" };
  return         { text: "#f87171", bg: "rgba(220,38,38,0.10)",   bar: "#f87171", glow: "rgba(220,38,38,0.25)" };
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_JOBS = [
  { _id: "1", title: "Senior Frontend Developer",  companyName: "Razorpay",  location: "Bangalore", jobType: "full-time", experienceLevel: "senior", salaryMin: 1800000, salaryMax: 2800000, requiredSkills: ["React","TypeScript","Node.js","GraphQL"], createdAt: new Date(Date.now()-86400000*2).toISOString(), isActive: true, _matchScore: 91 },
  { _id: "2", title: "Product Designer",            companyName: "Cred",      location: "Bangalore", jobType: "full-time", experienceLevel: "mid",    salaryMin: 1200000, salaryMax: 1800000, requiredSkills: ["Figma","Prototyping","User Research"],    createdAt: new Date(Date.now()-86400000*5).toISOString(), isActive: true, _matchScore: 74 },
  { _id: "3", title: "Backend Engineer (Node.js)",  companyName: "Zepto",     location: "Remote",    jobType: "contract",  experienceLevel: "mid",    salaryMin: 900000,  salaryMax: 1500000, requiredSkills: ["Node.js","MongoDB","Express","Redis"],    createdAt: new Date(Date.now()-86400000*1).toISOString(), isActive: true, _matchScore: 88 },
  { _id: "4", title: "Data Analyst",                companyName: "Meesho",    location: "Mumbai",    jobType: "full-time", experienceLevel: "junior", salaryMin: 600000,  salaryMax: 1000000, requiredSkills: ["SQL","Python","Tableau","Excel"],         createdAt: new Date(Date.now()-86400000*7).toISOString(), isActive: true },
  { _id: "5", title: "DevOps Engineer",             companyName: "Juspay",    location: "Remote",    jobType: "full-time", experienceLevel: "senior", salaryMin: 1500000, salaryMax: 2200000, requiredSkills: ["Kubernetes","AWS","Docker","Terraform"],  createdAt: new Date(Date.now()-86400000*3).toISOString(), isActive: true },
  { _id: "6", title: "ML Engineer",                 companyName: "Sarvam AI", location: "Bangalore", jobType: "full-time", experienceLevel: "mid",    salaryMin: 2000000, salaryMax: 3500000, requiredSkills: ["PyTorch","Python","LLMs","MLOps"],        createdAt: new Date(Date.now()-86400000*0.5).toISOString(), isActive: true, _matchScore: 62 },
];

// ─── Apply Modal ──────────────────────────────────────────────────────────────
function ApplyModal({ job, onClose, navigate }) {
  const [file,     setFile]     = useState(null);
  const [phase,    setPhase]    = useState("idle");
  const [result,   setResult]   = useState(null);
  const [errMsg,   setErrMsg]   = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const pickFile = (f) => {
    if (!f) return;
    if (f.type !== "application/pdf") { setErrMsg("Only PDF files are accepted."); return; }
    if (f.size > 3 * 1024 * 1024)    { setErrMsg("File must be under 3 MB."); return; }
    setFile(f); setErrMsg("");
  };

  const handleSubmit = async () => {
    if (!file) { setErrMsg("Please select your resume PDF first."); return; }
    setPhase("uploading"); setErrMsg("");
    try {
      const data = await applyToJob(job._id, file);
      setResult(data.application ?? data);
      setPhase("success");
    } catch (e) {
      const msg = e.response?.data?.message || "";
      setErrMsg(msg.toLowerCase().includes("already applied")
        ? "You've already applied to this job."
        : msg || "Application failed. Please try again.");
      setPhase("error");
    }
  };

  const lc = logoColor(job.companyName);

  return (
    <>
      <div className="apply-backdrop" onClick={onClose} />
      <div className="apply-modal" role="dialog" aria-modal="true">

        <div className="apply-modal__header">
          <div className="apply-modal__job">
            <div className="apply-modal__logo" style={{ background: lc.bg, color: lc.color, boxShadow: `0 0 0 1px ${lc.ring}` }}>
              {initials(job.companyName)}
            </div>
            <div>
              <div className="apply-modal__company">{job.companyName}</div>
              <div className="apply-modal__title">{job.title}</div>
            </div>
          </div>
          <button className="apply-modal__close" onClick={onClose}><XIcon /></button>
        </div>

        {phase === "uploading" && (
          <div className="apply-modal__body apply-modal__body--center">
            <div className="apply-modal__spinner" />
            <div className="apply-modal__uploading-title">Analyzing your resume…</div>
            <div className="apply-modal__uploading-sub">AI is scoring your match against the job description</div>
          </div>
        )}

        {phase === "success" && result && (
          <div className="apply-modal__body apply-modal__body--center">
            <div className="apply-modal__success-icon"><CheckIcon /></div>
            <div className="apply-modal__success-title">Application Submitted!</div>
            <div className="apply-modal__score-wrap">
              <svg className="apply-modal__ring" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
                <circle cx="48" cy="48" r="40" fill="none"
                  stroke={scoreColor(result.matchScore ?? 0).text} strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${((result.matchScore ?? 0) / 100) * 251} 251`}
                  transform="rotate(-90 48 48)"
                />
              </svg>
              <div className="apply-modal__ring-val" style={{ color: scoreColor(result.matchScore ?? 0).text }}>
                {result.matchScore ?? "—"}
              </div>
            </div>
            <div className="apply-modal__score-label">AI Match Score</div>
            {(result.skillsMatch || result.experienceMatch || result.keywordsMatch) && (
              <div className="apply-modal__breakdown">
                {[["Skills", result.skillsMatch], ["Experience", result.experienceMatch], ["Keywords", result.keywordsMatch]]
                  .map(([label, val]) => val != null && (
                    <div className="apply-modal__brow" key={label}>
                      <span className="apply-modal__brow-label">{label}</span>
                      <div className="apply-modal__brow-track">
                        <div className="apply-modal__brow-fill" style={{ width: `${val}%`, background: scoreColor(val).bar }} />
                      </div>
                      <span className="apply-modal__brow-val" style={{ color: scoreColor(val).text }}>{val}</span>
                    </div>
                  ))}
              </div>
            )}
            {result.aiSummary && <p className="apply-modal__summary">{result.aiSummary}</p>}
            <div className="apply-modal__success-actions">
              <button className="apply-modal__btn apply-modal__btn--primary" onClick={() => navigate("/applications")}>View My Applications →</button>
              <button className="apply-modal__btn apply-modal__btn--ghost" onClick={onClose}>Close</button>
            </div>
          </div>
        )}

        {(phase === "idle" || phase === "error") && (
          <div className="apply-modal__body">
            <div className="apply-modal__step-label">Step 1 of 1 — Upload Resume</div>
            <p className="apply-modal__desc">Upload your resume PDF. Our AI will score your match and submit your application instantly.</p>
            <div
              className={`apply-modal__dropzone${file ? " apply-modal__dropzone--ready" : ""}${dragOver ? " apply-modal__dropzone--drag" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); pickFile(e.dataTransfer.files[0]); }}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".pdf,application/pdf" style={{ display: "none" }} onChange={(e) => pickFile(e.target.files[0])} />
              {file ? (
                <>
                  <div className="apply-modal__file-icon">📄</div>
                  <div className="apply-modal__file-name">{file.name}</div>
                  <div className="apply-modal__file-size">{(file.size / 1024).toFixed(0)} KB · PDF</div>
                  <button className="apply-modal__file-change" onClick={(e) => { e.stopPropagation(); setFile(null); }}>Change file</button>
                </>
              ) : (
                <>
                  <div className="apply-modal__upload-icon"><UploadIcon /></div>
                  <div className="apply-modal__upload-title">{dragOver ? "Drop it here!" : "Drop your resume here"}</div>
                  <div className="apply-modal__upload-sub">or click to browse · PDF only · max 3 MB</div>
                </>
              )}
            </div>
            {errMsg && <div className="apply-modal__error">{errMsg}</div>}
            <div className="apply-modal__ai-note">
              <span className="apply-modal__ai-tag">AI</span>
              Gemini will score your resume against the job description and generate a match report.
            </div>
            <button
              className={`apply-modal__btn apply-modal__btn--primary apply-modal__btn--full${!file ? " apply-modal__btn--disabled" : ""}`}
              onClick={handleSubmit} disabled={!file}
            >Submit Application →</button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job, onClick, isNew }) {
  const lc     = logoColor(job.companyName);
  const salary = salaryLabel(job.salaryMin, job.salaryMax);
  const sc     = job._matchScore ? scoreColor(job._matchScore) : null;

  return (
    <div className={`jb-card${isNew ? " jb-card--new" : ""}`} onClick={() => onClick(job._id)}>
      {/* Top row */}
      <div className="jb-card__top">
        <div className="jb-card__logo" style={{ background: lc.bg, color: lc.color, boxShadow: `0 0 0 1px ${lc.ring}` }}>
          {initials(job.companyName)}
        </div>
        <div className="jb-card__meta-top">
          <span className="jb-card__company">{job.companyName || job.postedBy?.companyName || "Company"}</span>
          <span className="jb-card__time"><ClockIcon />{timeAgo(job.createdAt)}</span>
        </div>
        {sc && (
          <div className="jb-card__score-badge" style={{ background: sc.bg, color: sc.text }}>
            <SparkIcon />{job._matchScore}%
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="jb-card__title">{job.title}</h3>

      {/* Meta row */}
      <div className="jb-card__meta">
        <span className="jb-card__pill jb-card__pill--loc"><MapPinIcon />{job.location}</span>
        <span className="jb-card__pill jb-card__pill--type"><BriefcaseIcon />{job.jobType?.replace("-", " ")}</span>
        <span className={`jb-card__pill jb-card__pill--exp jb-card__pill--${job.experienceLevel}`}>{job.experienceLevel}</span>
        {salary && <span className="jb-card__salary">{salary}</span>}
      </div>

      {/* Skills */}
      <div className="jb-card__skills">
        {(job.requiredSkills || []).slice(0, 4).map((s) => (
          <span className="jb-card__skill" key={s}>{s}</span>
        ))}
        {(job.requiredSkills || []).length > 4 && (
          <span className="jb-card__skill jb-card__skill--more">+{job.requiredSkills.length - 4}</span>
        )}
      </div>

      {/* Footer */}
      <div className="jb-card__footer">
        {sc && (
          <div className="jb-card__bar-wrap">
            <div className="jb-card__bar-fill" style={{ width: `${job._matchScore}%`, background: sc.bar, boxShadow: `0 0 6px ${sc.glow}` }} />
          </div>
        )}
        <div className="jb-card__cta">View & Apply <ArrowIcon /></div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="jb-skeleton">
      <div className="jb-sk__top"><div className="jb-sk__avatar" /><div className="jb-sk__lines"><div className="jb-sk__line jb-sk__line--sm" /><div className="jb-sk__line jb-sk__line--xs" /></div></div>
      <div className="jb-sk__line jb-sk__line--lg" style={{ marginTop: 14 }} />
      <div className="jb-sk__row"><div className="jb-sk__pill" /><div className="jb-sk__pill" /><div className="jb-sk__pill" /></div>
      <div className="jb-sk__row"><div className="jb-sk__pill jb-sk__pill--w" /><div className="jb-sk__pill jb-sk__pill--w" /><div className="jb-sk__pill jb-sk__pill--w" /></div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onReset }) {
  return (
    <div className="jb-empty">
      <div className="jb-empty__icon"><BotIcon /></div>
      <div className="jb-empty__title">No jobs found</div>
      <div className="jb-empty__sub">Try adjusting your filters or search terms</div>
      <button className="jb-empty__reset" onClick={onReset}>Clear all filters</button>
    </div>
  );
}

// ─── Filter Chip ──────────────────────────────────────────────────────────────
function Chip({ label, active, onClick }) {
  return <button className={`jb-chip${active ? " jb-chip--active" : ""}`} onClick={onClick}>{label}</button>;
}

// ─── Job Drawer ───────────────────────────────────────────────────────────────
function JobDrawer({ job, onClose, isLoggedIn, onApply }) {
  const navigate = useNavigate();
  if (!job) return null;
  const lc     = logoColor(job.companyName);
  const salary = salaryLabel(job.salaryMin, job.salaryMax);
  const sc     = job._matchScore ? scoreColor(job._matchScore) : null;

  return (
    <>
      <div className="jb-drawer-backdrop" onClick={onClose} />
      <div className="jb-drawer">
        <button className="jb-drawer__close" onClick={onClose}><XIcon /></button>

        <div className="jb-drawer__header">
          <div className="jb-drawer__logo" style={{ background: lc.bg, color: lc.color, boxShadow: `0 0 0 1.5px ${lc.ring}` }}>
            {initials(job.companyName)}
          </div>
          <div>
            <div className="jb-drawer__company">{job.companyName}</div>
            <h2 className="jb-drawer__title">{job.title}</h2>
          </div>
        </div>

        {sc && (
          <div className="jb-drawer__match" style={{ borderColor: sc.text + "30", background: sc.bg }}>
            <div className="jb-drawer__match-top">
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: sc.text, fontWeight: 600, fontSize: 13 }}><SparkIcon />{job._matchScore}% AI Match</span>
              <span style={{ fontSize: 11, color: "#6b7280" }}>Based on your profile</span>
            </div>
            <div className="jb-drawer__match-bar">
              <div className="jb-drawer__match-fill" style={{ width: `${job._matchScore}%`, background: sc.bar, boxShadow: `0 0 8px ${sc.glow}` }} />
            </div>
          </div>
        )}

        <div className="jb-drawer__pills">
          <span className="jb-drawer__pill"><MapPinIcon />{job.location}</span>
          <span className="jb-drawer__pill"><BriefcaseIcon />{job.jobType?.replace("-", " ")}</span>
          <span className="jb-drawer__pill">{job.experienceLevel}</span>
          {salary && <span className="jb-drawer__pill">{salary} /yr</span>}
          <span className="jb-drawer__pill"><ClockIcon />Posted {timeAgo(job.createdAt)}</span>
        </div>

        <div className="jb-drawer__section">
          <div className="jb-drawer__label">Required Skills</div>
          <div className="jb-drawer__skills">
            {(job.requiredSkills || []).map((s) => <span className="jb-drawer__skill" key={s}>{s}</span>)}
          </div>
        </div>

        <div className="jb-drawer__section">
          <div className="jb-drawer__label">About This Role</div>
          <div className="jb-drawer__desc">{job.description || "Full job description available after applying."}</div>
        </div>

        {job.aiEnhancedDescription && (
          <div className="jb-drawer__section">
            <div className="jb-drawer__label jb-drawer__label--ai"><SparkIcon /><span>AI-Enhanced Description</span></div>
            <div className="jb-drawer__desc">{job.aiEnhancedDescription}</div>
          </div>
        )}

        <div className="jb-drawer__cta">
          {isLoggedIn
            ? <button className="jb-drawer__apply" onClick={() => onApply(job)}>Apply Now — Upload Resume <ArrowIcon /></button>
            : <button className="jb-drawer__apply" onClick={() => navigate("/login")}>Log in to Apply <ArrowIcon /></button>
          }
          <button className="jb-drawer__prep" onClick={() => navigate("/interview-prep")}>Prep with AI</button>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function JobsPage() {
  const navigate = useNavigate();

  const [user,            setUser]            = useState(null);
  const [jobs,            setJobs]            = useState([]);
  const [recommended,     setRecommended]     = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [isLoggedIn,      setIsLoggedIn]      = useState(false);
  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [expFilter,       setExpFilter]       = useState("");
  const [typeFilter,      setTypeFilter]      = useState("");
  const [page,            setPage]            = useState(1);
  const [totalPages,      setTotalPages]      = useState(1);
  const [total,           setTotal]           = useState(0);
  const [selectedJob,     setSelectedJob]     = useState(null);
  const [applyJob,        setApplyJob]        = useState(null);
  const [showFilters,     setShowFilters]     = useState(false);
  const [newJobIds,       setNewJobIds]       = useState(new Set());
  const debounceRef = useRef(null);

  const EXP_LEVELS = ["fresher", "junior", "mid", "senior", "lead"];
  const JOB_TYPES  = ["full-time", "part-time", "contract", "internship"];

  // Debounce search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Auth check + user fetch (for Sidebar)
  useEffect(() => {
    ax.get("/api/auth/me")
      .then((res) => { setIsLoggedIn(true); setUser(res.data.user ?? res.data); })
      .catch(() => setIsLoggedIn(false));
  }, []);

  // Fetch jobs
  useEffect(() => {
    setLoading(true);
    getAllJobs({ search: debouncedSearch, experienceLevel: expFilter, jobType: typeFilter, page })
      .then((data) => {
        const fetched = data.jobs || [];
        setJobs(fetched);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || fetched.length);
        setNewJobIds(new Set(fetched.filter((j) => Date.now() - new Date(j.createdAt) < 86400000).map((j) => j._id)));
      })
      .catch(() => {
        let f = MOCK_JOBS;
        if (debouncedSearch) { const q = debouncedSearch.toLowerCase(); f = f.filter((j) => j.title.toLowerCase().includes(q) || j.companyName.toLowerCase().includes(q) || j.requiredSkills.some((s) => s.toLowerCase().includes(q))); }
        if (expFilter)  f = f.filter((j) => j.experienceLevel === expFilter);
        if (typeFilter) f = f.filter((j) => j.jobType === typeFilter);
        setJobs(f); setTotalPages(1); setTotal(f.length);
      })
      .finally(() => setLoading(false));
  }, [debouncedSearch, expFilter, typeFilter, page]);

  // Fetch recommended
  useEffect(() => {
    if (!isLoggedIn) return;
    getRecommendedJobs().then((j) => setRecommended(j || [])).catch(() => {});
  }, [isLoggedIn]);

  const mergedJobs = jobs.map((j) => {
    const rec = recommended.find((r) => r._id === j._id);
    return rec ? { ...j, _matchScore: rec._matchScore || j._matchScore } : j;
  });

  const activeFilters = [expFilter, typeFilter].filter(Boolean).length;
  const resetFilters  = () => { setExpFilter(""); setTypeFilter(""); setSearch(""); setPage(1); };
  const handleApply   = (job) => { setSelectedJob(null); setApplyJob(job); };

  return (
    <div className="jb-layout">
      {/* ── Shared Sidebar ───────────────────────────────────────────── */}
      <Sidebar user={user} />

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="jb-page">

        {/* ── Page header ────────────────────────────────────────────── */}
        <div className="jb-header">
          <div className="jb-header__left">
            <h1 className="jb-header__title">Browse Jobs</h1>
            <p className="jb-header__sub">
              {total > 0 ? <><span className="jb-header__count">{total}</span> open positions across India</> : "Discover your next opportunity"}
            </p>
          </div>

          {isLoggedIn && recommended.length > 0 && (
            <div className="jb-header__stat">
              <TrendingIcon />
              <span><strong>{recommended.length}</strong> AI-matched for you</span>
            </div>
          )}
        </div>

        {/* ── Search + filters ───────────────────────────────────────── */}
        <div className="jb-controls">
          <div className="jb-search">
            <SearchIcon />
            <input
              className="jb-search__input"
              placeholder="Search by title, company, or skill…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && <button className="jb-search__clear" onClick={() => { setSearch(""); setPage(1); }}><XIcon /></button>}
          </div>

          <button className={`jb-filter-btn${showFilters || activeFilters > 0 ? " jb-filter-btn--active" : ""}`} onClick={() => setShowFilters(!showFilters)}>
            <FilterIcon />Filters{activeFilters > 0 && <span className="jb-filter-btn__badge">{activeFilters}</span>}
          </button>
        </div>

        {showFilters && (
          <div className="jb-filter-panel">
            <div className="jb-filter-group">
              <span className="jb-filter-group__label">Experience</span>
              <div className="jb-chips">
                {EXP_LEVELS.map((e) => <Chip key={e} label={e} active={expFilter === e} onClick={() => { setExpFilter(expFilter === e ? "" : e); setPage(1); }} />)}
              </div>
            </div>
            <div className="jb-filter-group">
              <span className="jb-filter-group__label">Type</span>
              <div className="jb-chips">
                {JOB_TYPES.map((t) => <Chip key={t} label={t.replace("-", " ")} active={typeFilter === t} onClick={() => { setTypeFilter(typeFilter === t ? "" : t); setPage(1); }} />)}
              </div>
            </div>
            {activeFilters > 0 && <button className="jb-filter-clear" onClick={resetFilters}><XIcon /> Clear all</button>}
          </div>
        )}

        {/* ── AI Recommended strip ───────────────────────────────────── */}
        {isLoggedIn && recommended.length > 0 && !debouncedSearch && !expFilter && !typeFilter && (
          <div className="jb-rec">
            <div className="jb-rec__label"><SparkIcon />AI Recommended</div>
            <div className="jb-rec__scroll">
              {recommended.slice(0, 6).map((job) => {
                const lc = logoColor(job.companyName);
                const sc = job._matchScore ? scoreColor(job._matchScore) : null;
                return (
                  <div className="jb-rec__card" key={job._id} onClick={() => setSelectedJob(job)}>
                    <div className="jb-rec__logo" style={{ background: lc.bg, color: lc.color }}>{initials(job.companyName)}</div>
                    <div className="jb-rec__info">
                      <div className="jb-rec__name">{job.title}</div>
                      <div className="jb-rec__co">{job.companyName}</div>
                    </div>
                    {sc && <div className="jb-rec__score" style={{ color: sc.text, background: sc.bg }}>{job._matchScore}%</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Results bar ────────────────────────────────────────────── */}
        <div className="jb-results-bar">
          <span className="jb-results-bar__count">{loading ? "Loading…" : `${total} ${total === 1 ? "job" : "jobs"} found`}</span>
          <span className="jb-results-bar__sort">Sorted by newest</span>
        </div>

        {/* ── Grid ───────────────────────────────────────────────────── */}
        {loading ? (
          <div className="jb-grid">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}</div>
        ) : mergedJobs.length === 0 ? (
          <EmptyState onReset={resetFilters} />
        ) : (
          <div className="jb-grid">
            {mergedJobs.map((job) => (
              <JobCard key={job._id} job={job} isNew={newJobIds.has(job._id)}
                onClick={(id) => setSelectedJob(mergedJobs.find((j) => j._id === id))}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ─────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="jb-pagination">
            <button className="jb-pag__btn" disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} className={`jb-pag__page${page === p ? " jb-pag__page--active" : ""}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="jb-pag__btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}><ChevronRight /></button>
          </div>
        )}
      </div>

      {/* ── Drawer ─────────────────────────────────────────────────────── */}
      {selectedJob && (
        <JobDrawer job={selectedJob} onClose={() => setSelectedJob(null)} isLoggedIn={isLoggedIn} onApply={handleApply} />
      )}

      {/* ── Apply Modal ────────────────────────────────────────────────── */}
      {applyJob && <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} navigate={navigate} />}
    </div>
  );
}