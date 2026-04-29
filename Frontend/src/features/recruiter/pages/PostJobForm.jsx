import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/post-job.scss";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
const JOB_TYPES = ["full-time", "part-time", "contract", "internship"];
const EXP_LEVELS = ["fresher", "junior", "mid", "senior", "lead"];

export default function PostJobForm() {
  const navigate = useNavigate();
  const skillInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "", description: "", companyName: "", location: "",
    requiredSkills: [], experienceLevel: "junior", jobType: "full-time",
    salaryMin: "", salaryMax: "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [enhancing, setEnhancing] = useState(false);
  const [enhanced, setEnhanced] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setEnhanced(null);
    setError("");
  };

  const addSkill = (raw) => {
    const skill = raw.trim().toLowerCase();
    if (!skill || form.requiredSkills.includes(skill)) return;
    setForm((f) => ({ ...f, requiredSkills: [...f.requiredSkills, skill] }));
    setSkillInput("");
  };

  const removeSkill = (s) =>
    setForm((f) => ({ ...f, requiredSkills: f.requiredSkills.filter((x) => x !== s) }));

  const handleSkillKey = (e) => {
    if (["Enter", ",", "Tab"].includes(e.key)) { e.preventDefault(); addSkill(skillInput); }
    if (e.key === "Backspace" && !skillInput && form.requiredSkills.length) {
      removeSkill(form.requiredSkills[form.requiredSkills.length - 1]);
    }
  };

  const handleEnhance = async () => {
    if (!form.title || !form.description) { setError("Add a title and description first."); return; }
    setEnhancing(true); setError("");
    try {
      const { data } = await axios.post(`${API}/api/jobs/enhance`,
        { title: form.title, description: form.description, requiredSkills: form.requiredSkills, experienceLevel: form.experienceLevel },
        { withCredentials: true }
      );
      setEnhanced(data);
    } catch (err) {
      setError(err.response?.data?.message || "AI enhancement failed. Try again.");
    } finally { setEnhancing(false); }
  };

  const applyEnhancement = () => {
    if (!enhanced) return;
    setForm((f) => ({
      ...f,
      title: enhanced.suggestedTitle || f.title,
      description: enhanced.enhancedDescription || f.description,
      requiredSkills: enhanced.suggestedSkills?.length
        ? [...new Set([...f.requiredSkills, ...enhanced.suggestedSkills.map((s) => s.toLowerCase())])]
        : f.requiredSkills,
    }));
    setEnhanced(null);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.companyName || !form.location) {
      setError("Title, description, company, and location are required.");
      return;
    }
    setSubmitting(true); setError("");
    try {
      await axios.post(`${API}/api/jobs`,
        { ...form, salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined, salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined },
        { withCredentials: true }
      );
      setSuccess(true);
      setTimeout(() => navigate("/recruiter"), 2200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post job.");
    } finally { setSubmitting(false); }
  };

  const filled = [form.title, form.description, form.companyName, form.location, form.requiredSkills.length > 0].filter(Boolean).length;
  const pct = Math.round((filled / 5) * 100);

  const steps = ["Basics", "Description", "Details", "Skills & Review"];

  if (success) {
    return (
      <div className="pjf-success">
        <div className="pjf-success__icon">
          <svg viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="26" stroke="#10b981" strokeWidth="2" />
            <path d="M17 28l7.5 7.5L39 21" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2>Job posted!</h2>
        <p>Your listing is live. Redirecting to dashboard…</p>
      </div>
    );
  }

  return (
    <div className="pjf">
      {/* Sidebar */}
      <aside className="pjf__sidebar">
        <div className="pjf__brand">
          <div className="pjf__brand-mark">H</div>
          <span>HireBot</span>
        </div>

        <div className="pjf__steps">
          {steps.map((label, i) => (
            <button
              key={i}
              className={`pjf__step ${activeSection === i ? "active" : ""} ${i < activeSection ? "done" : ""}`}
              onClick={() => setActiveSection(i)}
            >
              <div className="pjf__step-num">
                {i < activeSection
                  ? <svg viewBox="0 0 14 14" fill="none" width="12" height="12"><path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : i + 1}
              </div>
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="pjf__completeness">
          <div className="pjf__completeness-header">
            <span>Completeness</span>
            <span className="pjf__pct">{pct}%</span>
          </div>
          <div className="pjf__track">
            <div className="pjf__fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <button className="pjf__back" onClick={() => navigate("/recruiter")}>
          ← Back to dashboard
        </button>
      </aside>

      {/* Main */}
      <main className="pjf__main">
        <div className="pjf__header">
          <p className="pjf__eyebrow">Step {activeSection + 1} of {steps.length}</p>
          <h1 className="pjf__title">Post a new job</h1>
          <p className="pjf__sub">Fill in the details — AI can polish it for you.</p>
        </div>

        {error && (
          <div className="pjf__error">
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
              <circle cx="10" cy="10" r="9" stroke="#ef4444" strokeWidth="1.5"/>
              <path d="M10 6v4.5M10 13v.5" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        <div className="pjf__sections">
          {/* Section 0: Basics */}
          <div className={`pjf__section ${activeSection === 0 ? "active" : ""}`}>
            <div className="pjf__section-head" onClick={() => setActiveSection(0)}>
              <span className="pjf__section-num">01</span>
              <span className="pjf__section-name">Basics</span>
              <svg className={`pjf__chevron ${activeSection === 0 ? "open" : ""}`} viewBox="0 0 16 16" fill="none" width="16" height="16">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>

            {activeSection === 0 && (
              <div className="pjf__section-body">
                <div className="pjf__field">
                  <label className="pjf__label">Job title <span className="req">*</span></label>
                  <input type="text" placeholder="e.g. Senior Frontend Engineer"
                    value={form.title} onChange={(e) => handleChange("title", e.target.value)} />
                </div>
                <div className="pjf__row">
                  <div className="pjf__field">
                    <label className="pjf__label">Company name <span className="req">*</span></label>
                    <input type="text" placeholder="e.g. Razorpay"
                      value={form.companyName} onChange={(e) => handleChange("companyName", e.target.value)} />
                  </div>
                  <div className="pjf__field">
                    <label className="pjf__label">Location <span className="req">*</span></label>
                    <input type="text" placeholder="e.g. Bangalore / Remote"
                      value={form.location} onChange={(e) => handleChange("location", e.target.value)} />
                  </div>
                </div>
                <button className="pjf__next" onClick={() => setActiveSection(1)}>Continue →</button>
              </div>
            )}
          </div>

          {/* Section 1: Description */}
          <div className={`pjf__section ${activeSection === 1 ? "active" : ""}`}>
            <div className="pjf__section-head" onClick={() => setActiveSection(1)}>
              <span className="pjf__section-num">02</span>
              <span className="pjf__section-name">Description</span>
              <svg className={`pjf__chevron ${activeSection === 1 ? "open" : ""}`} viewBox="0 0 16 16" fill="none" width="16" height="16">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>

            {activeSection === 1 && (
              <div className="pjf__section-body">
                <div className="pjf__field">
                  <div className="pjf__label-row">
                    <label className="pjf__label">Description <span className="req">*</span></label>
                    <span className="pjf__char-count">{form.description.length} chars</span>
                  </div>
                  <textarea rows={9} placeholder="Describe responsibilities, requirements, and what makes this role exciting…"
                    value={form.description} onChange={(e) => handleChange("description", e.target.value)} />
                </div>

                <div className="pjf__ai-bar">
                  <div className="pjf__ai-info">
                    <span className="pjf__ai-badge">AI</span>
                    <span>Let Gemini rewrite, strengthen skills, and refine the title.</span>
                  </div>
                  <button className={`pjf__ai-btn ${enhancing ? "loading" : ""}`}
                    onClick={handleEnhance} disabled={enhancing || submitting}>
                    {enhancing ? <><span className="spinner" /> Enhancing…</> : "✦ Enhance"}
                  </button>
                </div>

                {enhanced && (
                  <div className="pjf__enhanced">
                    <div className="pjf__enhanced-header">
                      <span>✦ AI suggestions</span>
                      <button onClick={() => setEnhanced(null)}>✕</button>
                    </div>
                    {enhanced.suggestedTitle && (
                      <div className="pjf__enhanced-row">
                        <span className="pjf__enhanced-key">Suggested title</span>
                        <span className="pjf__enhanced-val">{enhanced.suggestedTitle}</span>
                      </div>
                    )}
                    {enhanced.suggestedSkills?.length > 0 && (
                      <div className="pjf__enhanced-row">
                        <span className="pjf__enhanced-key">Suggested skills</span>
                        <div className="pjf__enhanced-skills">
                          {enhanced.suggestedSkills.map((s) => <span key={s} className="skill-chip">{s}</span>)}
                        </div>
                      </div>
                    )}
                    {enhanced.enhancedDescription && (
                      <div className="pjf__enhanced-row">
                        <span className="pjf__enhanced-key">Enhanced description</span>
                        <p className="pjf__enhanced-preview">{enhanced.enhancedDescription.slice(0, 280)}…</p>
                      </div>
                    )}
                    <button className="pjf__apply-btn" onClick={applyEnhancement}>Apply all →</button>
                  </div>
                )}

                <button className="pjf__next" onClick={() => setActiveSection(2)}>Continue →</button>
              </div>
            )}
          </div>

          {/* Section 2: Details */}
          <div className={`pjf__section ${activeSection === 2 ? "active" : ""}`}>
            <div className="pjf__section-head" onClick={() => setActiveSection(2)}>
              <span className="pjf__section-num">03</span>
              <span className="pjf__section-name">Details & compensation</span>
              <svg className={`pjf__chevron ${activeSection === 2 ? "open" : ""}`} viewBox="0 0 16 16" fill="none" width="16" height="16">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>

            {activeSection === 2 && (
              <div className="pjf__section-body">
                <div className="pjf__field">
                  <label className="pjf__label">Job type</label>
                  <div className="pjf__chips">
                    {JOB_TYPES.map((t) => (
                      <button key={t} className={`chip ${form.jobType === t ? "selected" : ""}`}
                        onClick={() => handleChange("jobType", t)}>{t}</button>
                    ))}
                  </div>
                </div>
                <div className="pjf__field">
                  <label className="pjf__label">Experience level</label>
                  <div className="pjf__chips">
                    {EXP_LEVELS.map((l) => (
                      <button key={l} className={`chip ${form.experienceLevel === l ? "selected" : ""}`}
                        onClick={() => handleChange("experienceLevel", l)}>{l}</button>
                    ))}
                  </div>
                </div>
                <div className="pjf__row">
                  <div className="pjf__field">
                    <label className="pjf__label">Min salary (₹ LPA)</label>
                    <input type="number" placeholder="e.g. 8" min={0}
                      value={form.salaryMin} onChange={(e) => handleChange("salaryMin", e.target.value)} />
                  </div>
                  <div className="pjf__field">
                    <label className="pjf__label">Max salary (₹ LPA)</label>
                    <input type="number" placeholder="e.g. 20" min={0}
                      value={form.salaryMax} onChange={(e) => handleChange("salaryMax", e.target.value)} />
                  </div>
                </div>
                {form.salaryMin && form.salaryMax && (
                  <div className="pjf__salary-preview">
                    ₹{form.salaryMin}–{form.salaryMax} LPA · {form.jobType} · {form.experienceLevel}
                  </div>
                )}
                <button className="pjf__next" onClick={() => setActiveSection(3)}>Continue →</button>
              </div>
            )}
          </div>

          {/* Section 3: Skills + Submit */}
          <div className={`pjf__section ${activeSection === 3 ? "active" : ""}`}>
            <div className="pjf__section-head" onClick={() => setActiveSection(3)}>
              <span className="pjf__section-num">04</span>
              <span className="pjf__section-name">Skills & publish</span>
              <svg className={`pjf__chevron ${activeSection === 3 ? "open" : ""}`} viewBox="0 0 16 16" fill="none" width="16" height="16">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>

            {activeSection === 3 && (
              <div className="pjf__section-body">
                <div className="pjf__field">
                  <label className="pjf__label">Required skills</label>
                  <div className="pjf__skill-wrap" onClick={() => skillInputRef.current?.focus()}>
                    {form.requiredSkills.map((s) => (
                      <span key={s} className="skill-chip removable">
                        {s} <button onClick={() => removeSkill(s)}>×</button>
                      </span>
                    ))}
                    <input ref={skillInputRef} type="text"
                      placeholder={form.requiredSkills.length ? "" : "Type skill, press Enter"}
                      value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKey} onBlur={() => skillInput && addSkill(skillInput)} />
                  </div>
                  <p className="pjf__hint">Press Enter or comma to add each skill</p>
                </div>

                {/* Review */}
                <div className="pjf__review">
                  <div className="pjf__review-title">Review</div>
                  {[
                    ["Title", form.title],
                    ["Company", form.companyName],
                    ["Location", form.location],
                    ["Type", `${form.jobType} · ${form.experienceLevel}`],
                    ["Salary", form.salaryMin && form.salaryMax ? `₹${form.salaryMin}–${form.salaryMax} LPA` : "Not specified"],
                    ["Skills", form.requiredSkills.length ? form.requiredSkills.join(", ") : "None added"],
                  ].map(([label, val]) => (
                    <div className="pjf__review-row" key={label}>
                      <span className="pjf__review-key">{label}</span>
                      <span className="pjf__review-val">{val || <em>—</em>}</span>
                    </div>
                  ))}
                </div>

                <button className={`pjf__submit ${submitting ? "loading" : ""}`}
                  onClick={handleSubmit} disabled={submitting || enhancing}>
                  {submitting ? <><span className="spinner" /> Publishing…</> : "Publish listing →"}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}