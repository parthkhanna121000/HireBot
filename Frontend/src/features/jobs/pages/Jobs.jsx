import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
const Svg = ({ size = 14, sw = 2, filled = false, children }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke={filled ? "none" : "currentColor"}
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const SearchIcon    = () => <Svg size={17}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Svg>;
const FilterIcon    = () => <Svg size={15}><line x1="4" y1="6" x2="20" y2="6" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="10" y1="18" x2="14" y2="18" /></Svg>;
const MapPinIcon    = () => <Svg size={13}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></Svg>;
const BriefcaseIcon = () => <Svg size={13}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></Svg>;
const ClockIcon     = () => <Svg size={12}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></Svg>;
const SparkIcon     = () => <Svg size={12} filled><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></Svg>;
const ArrowIcon     = () => <Svg size={14}><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></Svg>;
const ChevronLeft   = () => <Svg size={15}><polyline points="15 18 9 12 15 6" /></Svg>;
const ChevronRight  = () => <Svg size={15}><polyline points="9 18 15 12 9 6" /></Svg>;
const XIcon         = () => <Svg size={14} sw={2.5}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Svg>;
const UploadIcon    = () => <Svg size={22} sw={1.75}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></Svg>;
const FileIcon      = () => <Svg size={26} sw={1.6}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></Svg>;
const CheckIcon     = () => <Svg size={28}><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></Svg>;
const BotIcon       = () => <Svg size={22} sw={1.5}><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></Svg>;
const AlertIcon     = () => <Svg size={16}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></Svg>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const NEW_WINDOW_MS = 86400000 * 3;

const timeAgo = (date) => {
  if (!date) return "Recently";
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)     return "just now";
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
};

// Fixes ₹0K – ₹0K bug when salaryMin/Max are < 1000 or unconfigured
const salaryLabel = (min, max) => {
  const a = Number(min) || 0;
  const b = Number(max) || 0;
  if (a < 1000 && b < 1000) return null;
  const fmt = (n) =>
    n >= 100000
      ? `₹${(n / 100000).toFixed(1).replace(/\.0$/, "")}L`
      : `₹${Math.round(n / 1000)}K`;
  if (a >= 1000 && b >= 1000) return a === b ? fmt(a) : `${fmt(a)} – ${fmt(b)}`;
  if (a >= 1000) return `${fmt(a)}+`;
  return `Up to ${fmt(b)}`;
};

const initials = (company) =>
  (company || "HB").split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

const formatSize = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// Colours live in jobs.scss as theme variables (light + dark). JS only picks a tone.
const logoTone = (str) => {
  let h = 0;
  for (let i = 0; i < (str || "").length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h) % 5;
};

// ≥80 teal, 60–79 amber, <60 rose
const scoreTone = (s) => (s >= 80 ? "high" : s >= 60 ? "mid" : "low");

// ─── Mock fallback data (preserved from original; match scores removed so no
//     fabricated AI scores are ever displayed) ────────────────────────────────
const MOCK_JOBS = [
  { _id: "1", title: "Senior Frontend Developer",  companyName: "Razorpay",  location: "Bangalore", jobType: "full-time", experienceLevel: "senior", salaryMin: 1800000, salaryMax: 2800000, requiredSkills: ["React","TypeScript","Node.js","GraphQL"], createdAt: new Date(Date.now()-86400000*2).toISOString(), isActive: true },
  { _id: "2", title: "Product Designer",           companyName: "Cred",      location: "Bangalore", jobType: "full-time", experienceLevel: "mid",    salaryMin: 1200000, salaryMax: 1800000, requiredSkills: ["Figma","Prototyping","User Research"],    createdAt: new Date(Date.now()-86400000*5).toISOString(), isActive: true },
  { _id: "3", title: "Backend Engineer (Node.js)", companyName: "Zepto",     location: "Remote",    jobType: "contract",  experienceLevel: "mid",    salaryMin: 900000,  salaryMax: 1500000, requiredSkills: ["Node.js","MongoDB","Express","Redis"],    createdAt: new Date(Date.now()-86400000*1).toISOString(), isActive: true },
  { _id: "4", title: "Data Analyst",               companyName: "Meesho",    location: "Mumbai",    jobType: "full-time", experienceLevel: "junior", salaryMin: 600000,  salaryMax: 1000000, requiredSkills: ["SQL","Python","Tableau","Excel"],         createdAt: new Date(Date.now()-86400000*7).toISOString(), isActive: true },
  { _id: "5", title: "DevOps Engineer",            companyName: "Juspay",    location: "Remote",    jobType: "full-time", experienceLevel: "senior", salaryMin: 1500000, salaryMax: 2200000, requiredSkills: ["Kubernetes","AWS","Docker","Terraform"],  createdAt: new Date(Date.now()-86400000*3).toISOString(), isActive: true },
  { _id: "6", title: "ML Engineer",                companyName: "Sarvam AI", location: "Bangalore", jobType: "full-time", experienceLevel: "mid",    salaryMin: 2000000, salaryMax: 3500000, requiredSkills: ["PyTorch","Python","LLMs","MLOps"],        createdAt: new Date(Date.now()-86400000*0.5).toISOString(), isActive: true },
];

const EXP_LEVELS = ["fresher", "junior", "mid", "senior", "lead"];
const JOB_TYPES  = ["full-time", "part-time", "contract", "internship"];
const SALARY_RANGES = [
  { id: "any", label: "Any compensation", min: 0 },
  { id: "6l",  label: "₹6L+ / yr",        min: 600000 },
  { id: "12l", label: "₹12L+ / yr",       min: 1200000 },
  { id: "20l", label: "₹20L+ / yr",       min: 2000000 },
];

// Windowed page list: 1 … 4 5 6 … 20
const getPageItems = (page, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items = [1];
  const start = Math.max(2, page - 1);
  const end   = Math.min(total - 1, page + 1);
  if (start > 2) items.push("gap-l");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push("gap-r");
  items.push(total);
  return items;
};

// ─── Dialog a11y: Escape, focus trap, focus return, body scroll lock ─────────
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useDialog(ref, onClose) {
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      Array.from(node.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null);

    (focusables()[0] || node).focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) { e.preventDefault(); node.focus(); return; }
      const first = items[0];
      const last  = items[items.length - 1];
      const active = document.activeElement;
      if (!node.contains(active)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && (active === first || active === node)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused && document.contains(previouslyFocused) && previouslyFocused.focus) {
        previouslyFocused.focus();
      }
    };
  }, [ref, onClose]);
}

// ─── Small shared pieces ──────────────────────────────────────────────────────
function Logo({ name, src, size = "md" }) {
  if (src) return <img src={src} alt="" className={`jb-logo jb-logo--${size} jb-logo--img`} />;
  return (
    <div className={`jb-logo jb-logo--${size} jb-logo--tone-${logoTone(name)}`} aria-hidden="true">
      {initials(name)}
    </div>
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button type="button" aria-pressed={active} className={`jb-chip${active ? " jb-chip--active" : ""}`} onClick={onClick}>
      {label}
    </button>
  );
}

// ─── Apply Modal ──────────────────────────────────────────────────────────────
function ApplyModal({ job, onClose, navigate }) {
  const [file,     setFile]     = useState(null);
  const [phase,    setPhase]    = useState("idle");
  const [result,   setResult]   = useState(null);
  const [errMsg,   setErrMsg]   = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef   = useRef(null);
  const dialogRef = useRef(null);

  useDialog(dialogRef, onClose);

  const company = job.companyName || job.postedBy?.companyName || "Company";

  const pickFile = (f) => {
    if (fileRef.current) fileRef.current.value = ""; // allow re-picking the same file
    if (!f) return;
    if (f.type !== "application/pdf") { setErrMsg("Only PDF files are accepted."); return; }
    if (f.size > 3 * 1024 * 1024)    { setErrMsg("File must be under 3 MB."); return; }
    setFile(f);
    setErrMsg("");
  };

  const handleSubmit = async () => {
    if (!file) { setErrMsg("Please select your resume PDF first."); return; }
    setPhase("uploading");
    setErrMsg("");
    try {
      const data = await applyToJob(job._id, file);
      setResult(data.application ?? data);
      setPhase("success");
    } catch (e) {
      const msg = e.response?.data?.message || "";
      setErrMsg(
        msg.toLowerCase().includes("already applied")
          ? "You've already applied to this job."
          : msg || "Application failed. Please check your connection and try again."
      );
      setPhase("error");
    }
  };

  const hasReturnedScore = result && typeof result.matchScore === "number";
  const hasBreakdown = result && (result.skillsMatch != null || result.experienceMatch != null || result.keywordsMatch != null);

  return (
    <>
      <div className="apply-backdrop" onClick={onClose} />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="apply-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-modal-title"
      >
        <div className="apply-modal__header">
          <div className="apply-modal__job">
            <Logo name={company} src={job.companyLogo} size="md" />
            <div className="apply-modal__job-text">
              <div className="apply-modal__company">{company}</div>
              <div id="apply-modal-title" className="apply-modal__title">{job.title}</div>
            </div>
          </div>
          <button type="button" className="apply-modal__close" onClick={onClose} aria-label="Close application modal">
            <XIcon />
          </button>
        </div>

        {phase === "uploading" && (
          <div className="apply-modal__body apply-modal__body--center" role="status" aria-live="polite">
            <div className="apply-modal__spinner" />
            <div className="apply-modal__uploading-title">Analyzing your resume…</div>
            <div className="apply-modal__uploading-sub">
              Gemini AI is evaluating your resume against the role requirements
            </div>
          </div>
        )}

        {phase === "success" && result && (
          <div className="apply-modal__body apply-modal__body--center" role="status" aria-live="polite">
            <div className="apply-modal__success-icon"><CheckIcon /></div>
            <div className="apply-modal__success-title">Application submitted</div>

            {hasReturnedScore && (
              <>
                <div className="apply-modal__score-wrap">
                  <svg className="apply-modal__ring" viewBox="0 0 96 96" aria-hidden="true">
                    <circle className="apply-modal__ring-track" cx="48" cy="48" r="40" fill="none" strokeWidth="7" />
                    <circle
                      className={`apply-modal__ring-fill jb-tone--${scoreTone(result.matchScore)}`}
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={`${(Math.min(100, result.matchScore) / 100) * 251} 251`}
                      transform="rotate(-90 48 48)"
                    />
                  </svg>
                  <div className="apply-modal__ring-val">{result.matchScore}%</div>
                </div>
                <div className="apply-modal__score-label">AI match score</div>
              </>
            )}

            {hasBreakdown && (
              <div className="apply-modal__breakdown">
                {[
                  ["Skills", result.skillsMatch],
                  ["Experience", result.experienceMatch],
                  ["Keywords", result.keywordsMatch],
                ].map(
                  ([label, val]) =>
                    val != null && (
                      <div className={`apply-modal__brow jb-tone--${scoreTone(val)}`} key={label}>
                        <span className="apply-modal__brow-label">{label}</span>
                        <div className="apply-modal__brow-track">
                          <div className="apply-modal__brow-fill" style={{ width: `${val}%` }} />
                        </div>
                        <span className="apply-modal__brow-val">{val}%</span>
                      </div>
                    )
                )}
              </div>
            )}

            {result.aiSummary && <p className="apply-modal__summary">{result.aiSummary}</p>}

            <div className="apply-modal__success-actions">
              <button type="button" className="apply-modal__btn apply-modal__btn--primary apply-modal__btn--full" onClick={() => navigate("/applications")}>
                View my applications
              </button>
              <button type="button" className="apply-modal__btn apply-modal__btn--ghost apply-modal__btn--full" onClick={onClose}>
                Back to jobs
              </button>
            </div>
          </div>
        )}

        {(phase === "idle" || phase === "error") && (
          <div className="apply-modal__body">
            <div>
              <h2 className="apply-modal__heading">Upload your resume</h2>
              <p className="apply-modal__desc">
                Submit a PDF. HireBot compares it with the job requirements and attaches your match report to the application.
              </p>
            </div>

            <div
              role="button"
              tabIndex={0}
              aria-label={file ? `Selected file ${file.name}. Press Enter to choose a different PDF` : "Upload resume PDF"}
              className={`apply-modal__dropzone${file ? " apply-modal__dropzone--ready" : ""}${dragOver ? " apply-modal__dropzone--drag" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); pickFile(e.dataTransfer.files[0]); }}
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileRef.current?.click(); } }}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,application/pdf"
                style={{ display: "none" }}
                onChange={(e) => pickFile(e.target.files[0])}
              />
              {file ? (
                <>
                  <div className="apply-modal__file-icon"><FileIcon /></div>
                  <div className="apply-modal__file-name">{file.name}</div>
                  <div className="apply-modal__file-size">{formatSize(file.size)} · PDF</div>
                  <button
                    type="button"
                    className="apply-modal__file-change"
                    onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                  >
                    Replace file
                  </button>
                </>
              ) : (
                <>
                  <div className="apply-modal__upload-icon"><UploadIcon /></div>
                  <div className="apply-modal__upload-title">{dragOver ? "Drop your PDF here" : "Drag and drop your resume"}</div>
                  <div className="apply-modal__upload-sub">or click to browse. PDF only, up to 3 MB.</div>
                </>
              )}
            </div>

            {errMsg && (
              <div className="apply-modal__error" role="alert">
                <AlertIcon />
                <span>{errMsg}</span>
              </div>
            )}

            <div className="apply-modal__ai-note">
              <span className="apply-modal__ai-tag">AI</span>
              <span>Gemini scores skill alignment, experience depth, and keyword coverage when you submit.</span>
            </div>

            <button
              type="button"
              className={`apply-modal__btn apply-modal__btn--primary apply-modal__btn--full${!file ? " apply-modal__btn--disabled" : ""}`}
              onClick={handleSubmit}
              disabled={!file}
            >
              {phase === "error" ? "Try again" : "Submit application"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job, onOpen, isNew, index }) {
  const company  = job.companyName || job.postedBy?.companyName || "Company";
  const salary   = salaryLabel(job.salaryMin, job.salaryMax);
  const hasScore = typeof job._matchScore === "number";
  const sc       = hasScore ? scoreTone(job._matchScore) : null;
  const skills   = job.requiredSkills || [];

  return (
    <article className={`jb-card${isNew ? " jb-card--new" : ""}`} style={{ "--stagger": `${Math.min(index, 8) * 40}ms` }}>
      <div className="jb-card__top">
        <Logo name={company} src={job.companyLogo} size="md" />
        <div className="jb-card__meta-top">
          <span className="jb-card__company">{company}</span>
          <span className="jb-card__time"><ClockIcon />{timeAgo(job.createdAt)}</span>
        </div>
        <div className="jb-card__badges">
          {isNew && <span className="jb-card__new-badge">NEW</span>}
          {sc && (
            <span className={`jb-card__score-badge jb-tone--${sc}`} title="AI profile match">
              <SparkIcon />{job._matchScore}%
            </span>
          )}
        </div>
      </div>

      <h3 className="jb-card__title">
        <button
          type="button"
          className="jb-card__open"
          onClick={() => onOpen(job)}
          aria-label={`${job.title} at ${company}. View details`}
        >
          {job.title}
        </button>
      </h3>

      <div className="jb-card__facts">
        {job.location && <span className="jb-card__fact"><MapPinIcon />{job.location}</span>}
        {job.jobType && <span className="jb-card__fact"><BriefcaseIcon />{job.jobType.replace("-", " ")}</span>}
        {job.experienceLevel && <span className={`jb-card__exp jb-card__exp--${job.experienceLevel}`}>{job.experienceLevel}</span>}
      </div>

      {salary && <div className="jb-card__salary">{salary}</div>}

      <div className="jb-card__skills">
        {skills.slice(0, 4).map((s) => (
          <span className="jb-card__skill" key={s}>{s}</span>
        ))}
        {skills.length > 4 && <span className="jb-card__skill jb-card__skill--more">+{skills.length - 4} more</span>}
      </div>

      <div className="jb-card__footer">
        {sc && (
          <div className={`jb-card__bar-wrap jb-tone--${sc}`} title={`${job._matchScore}% profile match`}>
            <div className="jb-card__bar-fill" style={{ width: `${job._matchScore}%` }} />
          </div>
        )}
        <div className="jb-card__cta" aria-hidden="true">
          <span>Explore opportunity</span>
          <span className="jb-card__cta-icon"><ArrowIcon /></span>
        </div>
      </div>
    </article>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="jb-skeleton" aria-hidden="true">
      <div className="jb-sk__top">
        <div className="jb-sk__avatar" />
        <div className="jb-sk__lines">
          <div className="jb-sk__line jb-sk__line--sm" />
          <div className="jb-sk__line jb-sk__line--xs" />
        </div>
      </div>
      <div className="jb-sk__line jb-sk__line--lg" style={{ marginTop: 6 }} />
      <div className="jb-sk__row"><div className="jb-sk__pill" /><div className="jb-sk__pill" /><div className="jb-sk__pill" /></div>
      <div className="jb-sk__row"><div className="jb-sk__pill jb-sk__pill--w" /><div className="jb-sk__pill jb-sk__pill--w" /></div>
    </div>
  );
}

function RecSkeleton() {
  return (
    <div className="jb-rec__card jb-rec__card--sk" aria-hidden="true">
      <div className="jb-sk__avatar" />
      <div className="jb-sk__lines">
        <div className="jb-sk__line jb-sk__line--lg" />
        <div className="jb-sk__line jb-sk__line--sm" />
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ mode, onReset }) {
  const copy = {
    search: {
      title: "No roles match your search",
      sub: "Try broader keywords or a different job title, or reset your search and filters.",
    },
    filters: {
      title: "No opportunities match these filters",
      sub: "Loosen the location, salary, or skill selections to see more openings.",
    },
    empty: {
      title: "No open roles right now",
      sub: "New roles are added regularly. Check back soon.",
    },
  }[mode] || {
    title: "No jobs found",
    sub: "Try adjusting your filters or search terms.",
  };

  return (
    <div className="jb-empty" role="status">
      <div className="jb-empty__icon"><BotIcon /></div>
      <h3 className="jb-empty__title">{copy.title}</h3>
      <p className="jb-empty__sub">{copy.sub}</p>
      {mode !== "empty" && (
        <button type="button" className="jb-empty__reset" onClick={onReset}>
          Reset search and filters
        </button>
      )}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
  return (
    <nav className="jb-pagination" aria-label="Jobs pagination">
      <button type="button" className="jb-pag__btn" aria-label="Previous page" disabled={page === 1} onClick={() => onChange(Math.max(1, page - 1))}>
        <ChevronLeft />
        <span>Prev</span>
      </button>

      <div className="jb-pag__pages">
        {getPageItems(page, totalPages).map((p) =>
          typeof p === "string" ? (
            <span className="jb-pag__gap" key={p} aria-hidden="true">…</span>
          ) : (
            <button
              type="button"
              key={p}
              aria-label={`Page ${p}`}
              aria-current={page === p ? "page" : undefined}
              className={`jb-pag__page${page === p ? " jb-pag__page--active" : ""}`}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          )
        )}
      </div>

      <span className="jb-pag__indicator">Page {page} of {totalPages}</span>

      <button type="button" className="jb-pag__btn" aria-label="Next page" disabled={page === totalPages} onClick={() => onChange(Math.min(totalPages, page + 1))}>
        <span>Next</span>
        <ChevronRight />
      </button>
    </nav>
  );
}

// ─── Job Details Drawer ───────────────────────────────────────────────────────
function JobDrawer({ job, onClose, isLoggedIn, onApply }) {
  const navigate  = useNavigate();
  const drawerRef = useRef(null);
  useDialog(drawerRef, onClose);

  const company  = job.companyName || job.postedBy?.companyName || "Company";
  const salary   = salaryLabel(job.salaryMin, job.salaryMax);
  const hasScore = typeof job._matchScore === "number";
  const sc       = hasScore ? scoreTone(job._matchScore) : null;

  return (
    <>
      <div className="jb-drawer-backdrop" onClick={onClose} />
      <aside ref={drawerRef} tabIndex={-1} className="jb-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-job-title">
        <div className="jb-drawer__grabber" aria-hidden="true" />
        <button type="button" className="jb-drawer__close" onClick={onClose} aria-label="Close job details">
          <XIcon />
        </button>

        <div className="jb-drawer__scroll">
          <div className="jb-drawer__header">
            <Logo name={company} src={job.companyLogo} size="lg" />
            <div>
              <div className="jb-drawer__company">{company}</div>
              <h2 id="drawer-job-title" className="jb-drawer__title">{job.title}</h2>
            </div>
          </div>

          {sc && (
            <div className="jb-drawer__match">
              <div className="jb-drawer__match-top">
                <span className={`jb-drawer__match-score jb-tone--${sc}`}>
                  <SparkIcon />{job._matchScore}% AI match
                </span>
                <span className="jb-drawer__match-note">Matched against your profile</span>
              </div>
              <div
                className={`jb-drawer__match-bar jb-tone--${sc}`}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={job._matchScore}
                aria-label="AI match score"
              >
                <div className="jb-drawer__match-fill" style={{ width: `${job._matchScore}%` }} />
              </div>
            </div>
          )}

          <dl className="jb-drawer__facts">
            {job.location && <div><dt>Location</dt><dd>{job.location}</dd></div>}
            {job.jobType && <div><dt>Job type</dt><dd>{job.jobType.replace("-", " ")}</dd></div>}
            {job.experienceLevel && <div><dt>Experience</dt><dd>{job.experienceLevel}</dd></div>}
            {salary && <div><dt>Compensation</dt><dd>{salary} / yr</dd></div>}
            <div><dt>Posted</dt><dd>{timeAgo(job.createdAt)}</dd></div>
          </dl>

          <section className="jb-drawer__section">
            <h3 className="jb-drawer__label">Required skills</h3>
            <div className="jb-drawer__skills">
              {(job.requiredSkills || []).map((s) => (
                <span className="jb-drawer__skill" key={s}>{s}</span>
              ))}
            </div>
          </section>

          <section className="jb-drawer__section">
            <h3 className="jb-drawer__label">About this role</h3>
            <div className="jb-drawer__desc">{job.description || "Full job description available after applying."}</div>
          </section>

          {job.aiEnhancedDescription && (
            <section className="jb-drawer__section jb-drawer__section--ai">
              <h3 className="jb-drawer__label jb-drawer__label--ai">
                <SparkIcon /><span>AI-enhanced role summary</span>
              </h3>
              <div className="jb-drawer__desc">{job.aiEnhancedDescription}</div>
            </section>
          )}
        </div>

        <div className="jb-drawer__cta">
          {isLoggedIn ? (
            <button type="button" className="jb-drawer__apply" onClick={() => onApply(job)}>
              Apply now
            </button>
          ) : (
            <button type="button" className="jb-drawer__apply" onClick={() => navigate("/login")}>
              Log in to apply
            </button>
          )}
          <button type="button" className="jb-drawer__prep" onClick={() => navigate("/interview-prep")}>
            Prep for interview with AI
          </button>
        </div>
      </aside>
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
  const [recLoading,      setRecLoading]      = useState(false);
  const [recError,        setRecError]        = useState(false);
  const [apiError,        setApiError]        = useState("");
  const [isLoggedIn,      setIsLoggedIn]      = useState(false);

  // Search & server-synced filters
  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [expFilter,       setExpFilter]       = useState("");
  const [typeFilter,      setTypeFilter]      = useState("");

  // Client-side refinements (Location, Salary, Skills)
  const [locationFilter,  setLocationFilter]  = useState("");
  const [salaryFilter,    setSalaryFilter]    = useState("any");
  const [skillFilter,     setSkillFilter]     = useState("");

  // Pagination & modals
  const [page,            setPage]            = useState(1);
  const [totalPages,      setTotalPages]      = useState(1);
  const [total,           setTotal]           = useState(0);
  const [selectedJob,     setSelectedJob]     = useState(null);
  const [applyJob,        setApplyJob]        = useState(null);
  const [showFilters,     setShowFilters]     = useState(false);
  const [newJobIds,       setNewJobIds]       = useState(new Set());
  const [reloadTick,      setReloadTick]      = useState(0);
  const [recTick,         setRecTick]         = useState(0);
  const debounceRef = useRef(null);

  // Debounce search (preserved 400ms behavior)
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Auth check + user fetch (for Sidebar)
  useEffect(() => {
    ax.get("/auth/me")
      .then((res) => { setIsLoggedIn(true); setUser(res.data.user ?? res.data); })
      .catch(() => setIsLoggedIn(false));
  }, []);

  // Fetch jobs (preserves getAllJobs contract; stale responses are ignored)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setApiError("");
    getAllJobs({ search: debouncedSearch, experienceLevel: expFilter, jobType: typeFilter, page })
      .then((data) => {
        if (cancelled) return;
        const fetched = data.jobs || [];
        setJobs(fetched);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || fetched.length);
        setNewJobIds(
          new Set(fetched.filter((j) => Date.now() - new Date(j.createdAt) < NEW_WINDOW_MS).map((j) => j._id))
        );
      })
      .catch(() => {
        if (cancelled) return;
        // Preserved fallback: sample listings when the live feed fails
        let f = MOCK_JOBS;
        if (debouncedSearch) {
          const q = debouncedSearch.toLowerCase();
          f = f.filter(
            (j) =>
              j.title.toLowerCase().includes(q) ||
              j.companyName.toLowerCase().includes(q) ||
              (j.description || "").toLowerCase().includes(q) ||
              (j.requiredSkills || []).some((s) => s.toLowerCase().includes(q))
          );
        }
        if (expFilter)  f = f.filter((j) => j.experienceLevel === expFilter);
        if (typeFilter) f = f.filter((j) => j.jobType === typeFilter);
        setJobs(f);
        setTotalPages(1);
        setTotal(f.length);
        setNewJobIds(new Set()); // sample data is never flagged as "new"
        setApiError("We couldn't reach the live job feed, so you're seeing sample listings.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedSearch, expFilter, typeFilter, page, reloadTick]);

  // Fetch AI recommendations
  useEffect(() => {
    if (!isLoggedIn) return undefined;
    let cancelled = false;
    setRecLoading(true);
    setRecError(false);
    getRecommendedJobs()
      .then((j) => { if (!cancelled) setRecommended(j || []); })
      .catch(() => { if (!cancelled) setRecError(true); })
      .finally(() => { if (!cancelled) setRecLoading(false); });
    return () => { cancelled = true; };
  }, [isLoggedIn, recTick]);

  // Dynamic filter options derived from loaded jobs
  const availableLocations = useMemo(() => {
    const locs = new Set(jobs.map((j) => j.location).filter(Boolean));
    return Array.from(locs).slice(0, 8);
  }, [jobs]);

  const availableSkills = useMemo(() => {
    const counts = {};
    jobs.forEach((j) => {
      (j.requiredSkills || []).forEach((s) => {
        counts[s] = (counts[s] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill]) => skill);
  }, [jobs]);

  const recById = useMemo(() => new Map(recommended.map((r) => [r._id, r])), [recommended]);

  // Merge match scores & apply client-side location/salary/skill refinements
  const displayedJobs = useMemo(() => {
    const minSal = SALARY_RANGES.find((r) => r.id === salaryFilter)?.min || 0;

    return jobs
      .map((j) => {
        const rec = recById.get(j._id);
        return rec ? { ...j, _matchScore: rec._matchScore || j._matchScore } : j;
      })
      .filter((j) => {
        if (locationFilter && (j.location || "").toLowerCase() !== locationFilter.toLowerCase()) return false;
        if (minSal > 0) {
          const topSal = Math.max(Number(j.salaryMax) || 0, Number(j.salaryMin) || 0);
          if (topSal < minSal) return false;
        }
        if (skillFilter && !(j.requiredSkills || []).some((s) => s.toLowerCase() === skillFilter.toLowerCase())) {
          return false;
        }
        return true;
      });
  }, [jobs, recById, locationFilter, salaryFilter, skillFilter]);

  const activeFilters = [
    expFilter,
    typeFilter,
    locationFilter,
    salaryFilter !== "any" ? salaryFilter : "",
    skillFilter,
  ].filter(Boolean).length;

  const clientFiltersActive = Boolean(locationFilter || salaryFilter !== "any" || skillFilter);

  const resetFilters = () => {
    setExpFilter("");
    setTypeFilter("");
    setLocationFilter("");
    setSalaryFilter("any");
    setSkillFilter("");
    setSearch("");
    setPage(1);
  };

  const closeDrawer = useCallback(() => setSelectedJob(null), []);
  const closeApply  = useCallback(() => setApplyJob(null), []);

  const handleApply = useCallback((job) => {
    setSelectedJob(null);
    setApplyJob(job);
  }, []);

  const goToPage = (p) => {
    setPage(p);
    window.scrollTo({ top: 0 });
  };

  const emptyMode = debouncedSearch ? "search" : activeFilters > 0 ? "filters" : "empty";
  const showRec =
    isLoggedIn && (recLoading || recommended.length > 0 || recError) && !debouncedSearch && activeFilters === 0;

  const resultsText = loading
    ? "Loading opportunities…"
    : clientFiltersActive
    ? `${displayedJobs.length} of ${jobs.length} on this page match · ${total} total`
    : `Showing ${displayedJobs.length} of ${total} ${total === 1 ? "opportunity" : "opportunities"}`;

  return (
    <div className="jb-layout">
      <Sidebar user={user} />

      <main className="jb-page">
        {/* Header */}
        <header className="jb-header">
          <div className="jb-header__main">
            <h1 className="jb-header__title">Find Your Next Opportunity.</h1>
            <p className="jb-header__sub">
              Browse open engineering, product, and AI roles. When you're signed in, HireBot scores each one against your skills and experience.
            </p>
          </div>

          <div className="jb-header__metrics">
            <div className="jb-stat">
              <span className="jb-stat__val">{total}</span>
              <span className="jb-stat__lbl">open roles</span>
            </div>
            {newJobIds.size > 0 && (
              <div className="jb-stat jb-stat--fresh" title="Counted on the current page of results">
                <span className="jb-stat__dot" aria-hidden="true" />
                <span><strong>{newJobIds.size}</strong> new in the last 3 days</span>
              </div>
            )}
            {isLoggedIn && recommended.length > 0 && (
              <div className="jb-stat jb-stat--ai">
                <SparkIcon />
                <span><strong>{recommended.length}</strong> profile matches</span>
              </div>
            )}
          </div>
        </header>

        {/* API error notice */}
        {apiError && (
          <div className="jb-alert" role="alert">
            <AlertIcon />
            <span>{apiError}</span>
            <button type="button" onClick={() => setReloadTick((t) => t + 1)}>Retry</button>
          </div>
        )}

        {/* Search and filters */}
        <section className="jb-controls-wrap" aria-label="Search and filter jobs">
          <div className="jb-controls">
            <div className="jb-search">
              <SearchIcon />
              <input
                type="search"
                className="jb-search__input"
                aria-label="Search jobs by title, company, or description"
                placeholder="Search by job title, company, skill, or description"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="jb-search__clear"
                  aria-label="Clear search query"
                  onClick={() => { setSearch(""); setPage(1); }}
                >
                  <XIcon />
                </button>
              )}
            </div>

            <button
              type="button"
              aria-expanded={showFilters}
              aria-controls="jb-filter-panel"
              className={`jb-filter-btn${showFilters ? " jb-filter-btn--open" : ""}${activeFilters > 0 ? " jb-filter-btn--active" : ""}`}
              onClick={() => setShowFilters((s) => !s)}
            >
              <FilterIcon />
              <span>Filters</span>
              {activeFilters > 0 && <span className="jb-filter-btn__badge" aria-label={`${activeFilters} active`}>{activeFilters}</span>}
            </button>
          </div>

          {showFilters && (
            <div className="jb-filter-panel" id="jb-filter-panel">
              {availableLocations.length > 0 && (
                <div className="jb-filter-group">
                  <span className="jb-filter-group__label">Location</span>
                  <div className="jb-chips">
                    {availableLocations.map((loc) => (
                      <Chip key={loc} label={loc} active={locationFilter === loc} onClick={() => setLocationFilter(locationFilter === loc ? "" : loc)} />
                    ))}
                  </div>
                </div>
              )}

              <div className="jb-filter-group">
                <span className="jb-filter-group__label">Job type</span>
                <div className="jb-chips">
                  {JOB_TYPES.map((t) => (
                    <Chip key={t} label={t.replace("-", " ")} active={typeFilter === t} onClick={() => { setTypeFilter(typeFilter === t ? "" : t); setPage(1); }} />
                  ))}
                </div>
              </div>

              <div className="jb-filter-group">
                <span className="jb-filter-group__label">Experience</span>
                <div className="jb-chips">
                  {EXP_LEVELS.map((e) => (
                    <Chip key={e} label={e} active={expFilter === e} onClick={() => { setExpFilter(expFilter === e ? "" : e); setPage(1); }} />
                  ))}
                </div>
              </div>

              <div className="jb-filter-group">
                <span className="jb-filter-group__label">Salary range</span>
                <div className="jb-chips">
                  {SALARY_RANGES.map((r) => (
                    <Chip key={r.id} label={r.label} active={salaryFilter === r.id} onClick={() => setSalaryFilter(salaryFilter === r.id ? "any" : r.id)} />
                  ))}
                </div>
              </div>

              {availableSkills.length > 0 && (
                <div className="jb-filter-group jb-filter-group--wide">
                  <span className="jb-filter-group__label">Skills</span>
                  <div className="jb-chips">
                    {availableSkills.map((sk) => (
                      <Chip key={sk} label={sk} active={skillFilter === sk} onClick={() => setSkillFilter(skillFilter === sk ? "" : sk)} />
                    ))}
                  </div>
                </div>
              )}

              <div className="jb-filter-foot">
                <span className="jb-filter-foot__note">Location, salary, and skills narrow the roles on the current page. Job type and experience search all roles.</span>
                {activeFilters > 0 && (
                  <button type="button" className="jb-filter-clear" onClick={resetFilters}>
                    <XIcon /> Clear all ({activeFilters})
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* AI recommended jobs */}
        {showRec && (
          <section className="jb-rec" aria-labelledby="rec-heading">
            <div className="jb-rec__head">
              <div className="jb-rec__kicker"><SparkIcon /> AI profile match</div>
              <h2 id="rec-heading" className="jb-rec__title">Picked for Your Profile</h2>
              <p className="jb-rec__sub">Opportunities matched to your skills and experience.</p>
            </div>

            {recError && !recLoading && recommended.length === 0 ? (
              <div className="jb-rec__error" role="alert">
                <AlertIcon />
                <span>Couldn't load your recommendations.</span>
                <button type="button" onClick={() => setRecTick((t) => t + 1)}>Retry</button>
              </div>
            ) : (
              <div className="jb-rec__scroll">
                {recLoading
                  ? Array.from({ length: 4 }).map((_, i) => <RecSkeleton key={i} />)
                  : recommended.slice(0, 6).map((job) => {
                      const company = job.companyName || "Company";
                      const hasScore = typeof job._matchScore === "number";
                      const sc = hasScore ? scoreTone(job._matchScore) : null;
                      return (
                        <button
                          type="button"
                          className="jb-rec__card"
                          key={job._id}
                          onClick={() => setSelectedJob(job)}
                          aria-label={`${job.title} at ${company}${hasScore ? `, ${job._matchScore}% match` : ""}`}
                        >
                          <span className="jb-rec__card-top">
                            <Logo name={company} src={job.companyLogo} size="sm" />
                            <span className="jb-rec__info">
                              <span className="jb-rec__name">{job.title}</span>
                              <span className="jb-rec__co">{company}</span>
                            </span>
                            {sc && (
                              <span className={`jb-rec__score jb-tone--${sc}`}>
                                {job._matchScore}%
                              </span>
                            )}
                          </span>
                          {sc && (
                            <span className={`jb-rec__meter jb-tone--${sc}`}>
                              <span className="jb-rec__meter-fill" style={{ width: `${job._matchScore}%` }} />
                            </span>
                          )}
                        </button>
                      );
                    })}
              </div>
            )}
          </section>
        )}

        {/* Results bar */}
        <div className="jb-results-bar">
          <span className="jb-results-bar__count" aria-live="polite">{resultsText}</span>
          <span className="jb-results-bar__sort">Sorted by newest</span>
        </div>

        {/* Listing grid */}
        {loading ? (
          <div className="jb-grid" aria-busy="true">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div>
        ) : displayedJobs.length === 0 ? (
          <EmptyState mode={emptyMode} onReset={resetFilters} />
        ) : (
          <div className="jb-grid">
            {displayedJobs.map((job, idx) => (
              <JobCard key={job._id} job={job} index={idx} isNew={newJobIds.has(job._id)} onOpen={setSelectedJob} />
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={goToPage} />}
      </main>

      {selectedJob && (
        <JobDrawer job={selectedJob} onClose={closeDrawer} isLoggedIn={isLoggedIn} onApply={handleApply} />
      )}

      {applyJob && <ApplyModal job={applyJob} onClose={closeApply} navigate={navigate} />}
    </div>
  );
}