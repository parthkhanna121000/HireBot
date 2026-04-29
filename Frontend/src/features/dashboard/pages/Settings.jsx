import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// import Sidebar from "../components/Sidebar";
import Sidebar from "../../shared/Sidebar"
// import "./settings.scss";
import "../styles/settings.scss"

const ax = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
  User:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Lock:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Bell:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Palette:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>,
  Shield:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Check:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Eye:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  Camera:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Trash:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Globe:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  ChevRight:() => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Save:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Zap:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
};

// ─── Sidebar tabs ─────────────────────────────────────────────────────────────
const TABS = [
  { id: "profile",       label: "Profile",       icon: <Icons.User /> },
  { id: "security",      label: "Security",      icon: <Icons.Lock /> },
  { id: "notifications", label: "Notifications", icon: <Icons.Bell /> },
  { id: "appearance",    label: "Appearance",    icon: <Icons.Palette /> },
  { id: "privacy",       label: "Privacy",       icon: <Icons.Shield /> },
];

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      className={`s-toggle ${checked ? "s-toggle--on" : ""} ${disabled ? "s-toggle--disabled" : ""}`}
      onClick={() => !disabled && onChange(!checked)}
      role="switch"
      aria-checked={checked}
    >
      <span className="s-toggle__thumb" />
    </button>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function Section({ title, description, children }) {
  return (
    <div className="s-section">
      <div className="s-section__head">
        <div className="s-section__title">{title}</div>
        {description && <div className="s-section__desc">{description}</div>}
      </div>
      <div className="s-section__body">{children}</div>
    </div>
  );
}

// ─── Field Row ────────────────────────────────────────────────────────────────
function FieldRow({ label, hint, children }) {
  return (
    <div className="s-field">
      <div className="s-field__left">
        <div className="s-field__label">{label}</div>
        {hint && <div className="s-field__hint">{hint}</div>}
      </div>
      <div className="s-field__right">{children}</div>
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
function Input({ type = "text", value, onChange, placeholder, maxLength, suffix }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="s-input-wrap">
      <input
        type={isPassword && show ? "text" : type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="s-input"
        spellCheck={false}
      />
      {isPassword && (
        <button className="s-input-eye" onClick={() => setShow(!show)}>
          {show ? <Icons.EyeOff /> : <Icons.Eye />}
        </button>
      )}
      {suffix && <span className="s-input-suffix">{suffix}</span>}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div className={`s-toast s-toast--${type}`}>
      {type === "success" ? <Icons.Check /> : <span>!</span>}
      {msg}
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab({ user, onSave }) {
  const [form, setForm] = useState({
    username: user?.username || "",
    email:    user?.email    || "",
    bio:      user?.bio      || "",
    location: user?.location || "",
    website:  user?.website  || "",
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast]   = useState(null);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await ax.put("/api/user/profile", form);
      setToast({ msg: "Profile saved successfully!", type: "success" });
      onSave?.();
    } catch {
      setToast({ msg: "Failed to save. Please try again.", type: "error" });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3500);
    }
  };

  const initials = (name = "") =>
    name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

  return (
    <div className="s-tab-content">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <Section title="Avatar" description="Your profile picture is generated from your initials.">
        <div className="s-avatar-row">
          <div className="s-avatar">{initials(form.username)}</div>
          <div className="s-avatar-info">
            <div className="s-avatar-name">{form.username || "Your Name"}</div>
            <div className="s-avatar-sub">{form.email || "your@email.com"}</div>
          </div>
        </div>
      </Section>

      <Section title="Basic Information" description="Your public-facing identity on HireBot.">
        <FieldRow label="Full Name" hint="Shown on your profile and applications">
          <Input value={form.username} onChange={set("username")} placeholder="Ada Lovelace" maxLength={60} />
        </FieldRow>
        <FieldRow label="Email Address" hint="Used for login and notifications">
          <Input type="email" value={form.email} onChange={set("email")} placeholder="ada@example.com" />
        </FieldRow>
        <FieldRow label="Bio" hint="A short intro for recruiters">
          <textarea
            className="s-textarea"
            value={form.bio}
            onChange={(e) => set("bio")(e.target.value)}
            placeholder="Full-stack engineer with 5 years of experience…"
            rows={3}
            maxLength={300}
          />
          <div className="s-char-count">{form.bio.length}/300</div>
        </FieldRow>
      </Section>

      <Section title="Location & Links" description="Help recruiters know where you're based.">
        <FieldRow label="Location" hint="City, Country">
          <Input value={form.location} onChange={set("location")} placeholder="San Francisco, CA" />
        </FieldRow>
        <FieldRow label="Website / Portfolio" hint="Personal site or portfolio URL">
          <Input value={form.website} onChange={set("website")} placeholder="https://yoursite.com" suffix={<Icons.Globe />} />
        </FieldRow>
      </Section>

      <div className="s-save-row">
        <button className="s-btn-save" onClick={handleSave} disabled={saving}>
          {saving ? <span className="s-btn-spinner" /> : <Icons.Save />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────
function SecurityTab() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast]   = useState(null);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const strength = () => {
    const p = form.next;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8)           s++;
    if (/[A-Z]/.test(p))         s++;
    if (/[0-9]/.test(p))         s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const strLabel  = ["", "Weak", "Fair", "Good", "Strong"];
  const strColors = ["", "#f87171", "#fbbf24", "#60a5fa", "#34d399"];
  const s = strength();

  const handleSave = async () => {
    if (form.next !== form.confirm) {
      setToast({ msg: "Passwords don't match.", type: "error" });
      return;
    }
    setSaving(true);
    try {
      await ax.put("/api/user/password", { current: form.current, password: form.next });
      setToast({ msg: "Password updated!", type: "success" });
      setForm({ current: "", next: "", confirm: "" });
    } catch {
      setToast({ msg: "Incorrect current password.", type: "error" });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3500);
    }
  };

  return (
    <div className="s-tab-content">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <Section title="Change Password" description="Use a strong, unique password to keep your account safe.">
        <FieldRow label="Current Password">
          <Input type="password" value={form.current} onChange={set("current")} placeholder="Your current password" />
        </FieldRow>
        <FieldRow label="New Password">
          <Input type="password" value={form.next} onChange={set("next")} placeholder="At least 8 characters" />
          {form.next && (
            <div className="s-strength">
              <div className="s-strength__bar">
                {[1,2,3,4].map((n) => (
                  <div key={n} className="s-strength__seg" style={{ background: n <= s ? strColors[s] : undefined }} />
                ))}
              </div>
              <span style={{ color: strColors[s] }}>{strLabel[s]}</span>
            </div>
          )}
        </FieldRow>
        <FieldRow label="Confirm New Password">
          <Input type="password" value={form.confirm} onChange={set("confirm")} placeholder="Repeat new password" />
        </FieldRow>
      </Section>

      <Section title="Active Sessions" description="Devices currently logged in to your account.">
        <div className="s-sessions">
          {[
            { device: "Chrome on macOS", location: "Mumbai, IN", current: true,  time: "Now" },
            { device: "Firefox on Windows", location: "Delhi, IN", current: false, time: "2 days ago" },
          ].map((sess, i) => (
            <div className="s-session" key={i}>
              <div className="s-session__dot" style={{ background: sess.current ? "#34d399" : "#444" }} />
              <div className="s-session__info">
                <div className="s-session__device">{sess.device}</div>
                <div className="s-session__meta">{sess.location} · {sess.time}</div>
              </div>
              {sess.current
                ? <span className="s-session__cur">This device</span>
                : <button className="s-session__revoke">Revoke</button>
              }
            </div>
          ))}
        </div>
      </Section>

      <div className="s-save-row">
        <button className="s-btn-save" onClick={handleSave} disabled={saving || !form.current || !form.next}>
          {saving ? <span className="s-btn-spinner" /> : <Icons.Lock />}
          {saving ? "Updating…" : "Update Password"}
        </button>
      </div>
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────
function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    statusUpdates:   true,
    newMatches:      true,
    weeklyDigest:    false,
    recruiterViews:  true,
    marketingEmails: false,
    browserPush:     false,
  });
  const [saved, setSaved] = useState(false);

  const set = (key) => (val) => setPrefs((p) => ({ ...p, [key]: val }));

  const groups = [
    {
      title: "Application Activity",
      items: [
        { key: "statusUpdates",  label: "Status updates",   hint: "When your application status changes" },
        { key: "recruiterViews", label: "Recruiter views",  hint: "When a recruiter views your profile" },
        { key: "newMatches",     label: "New job matches",  hint: "When AI finds a great role for you" },
      ],
    },
    {
      title: "Email Preferences",
      items: [
        { key: "weeklyDigest",    label: "Weekly digest",      hint: "A summary of your activity each week" },
        { key: "marketingEmails", label: "Tips & updates",     hint: "Product news and career advice" },
      ],
    },
    {
      title: "Browser",
      items: [
        { key: "browserPush", label: "Push notifications", hint: "Real-time alerts in your browser" },
      ],
    },
  ];

  return (
    <div className="s-tab-content">
      {saved && <Toast msg="Notification preferences saved!" type="success" />}

      {groups.map((g) => (
        <Section key={g.title} title={g.title}>
          {g.items.map((item) => (
            <FieldRow key={item.key} label={item.label} hint={item.hint}>
              <Toggle checked={prefs[item.key]} onChange={set(item.key)} />
            </FieldRow>
          ))}
        </Section>
      ))}

      <div className="s-save-row">
        <button className="s-btn-save" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}>
          <Icons.Save />
          Save Preferences
        </button>
      </div>
    </div>
  );
}

// ─── Appearance Tab ───────────────────────────────────────────────────────────
function AppearanceTab() {
  const [accent, setAccent] = useState("teal");
  const [density, setDensity] = useState("comfortable");
  const [font, setFont] = useState("jakarta");

  const accents = [
    { id: "teal",   color: "#1D9E75", label: "Teal" },
    { id: "blue",   color: "#3b82f6", label: "Blue" },
    { id: "purple", color: "#8b5cf6", label: "Purple" },
    { id: "amber",  color: "#f59e0b", label: "Amber" },
    { id: "rose",   color: "#f43f5e", label: "Rose" },
  ];

  return (
    <div className="s-tab-content">
      <Section title="Accent Color" description="Personalise the highlight colour throughout the app.">
        <div className="s-accents">
          {accents.map((a) => (
            <button
              key={a.id}
              className={`s-accent-swatch ${accent === a.id ? "s-accent-swatch--active" : ""}`}
              style={{ "--clr": a.color }}
              onClick={() => setAccent(a.id)}
              title={a.label}
            >
              {accent === a.id && <Icons.Check />}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Information Density" description="Choose how compact the interface feels.">
        <div className="s-density-row">
          {["compact", "comfortable", "spacious"].map((d) => (
            <button
              key={d}
              className={`s-density-opt ${density === d ? "s-density-opt--active" : ""}`}
              onClick={() => setDensity(d)}
            >
              <div className="s-density-icon">
                {d === "compact"     && <>{[0,1,2,3,4].map(i => <div key={i} />)}</>}
                {d === "comfortable" && <>{[0,1,2].map(i => <div key={i} />)}</>}
                {d === "spacious"    && <>{[0,1].map(i => <div key={i} />)}</>}
              </div>
              <span>{d.charAt(0).toUpperCase() + d.slice(1)}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Font Style" description="Pick the typography that suits you.">
        <div className="s-fonts">
          {[
            { id: "jakarta", label: "Plus Jakarta", sub: "Clean & modern" },
            { id: "mono",    label: "Monospace",    sub: "Code-forward" },
            { id: "serif",   label: "Fraunces",     sub: "Editorial" },
          ].map((f) => (
            <button
              key={f.id}
              className={`s-font-opt ${font === f.id ? "s-font-opt--active" : ""}`}
              onClick={() => setFont(f.id)}
            >
              <span className="s-font-label">{f.label}</span>
              <span className="s-font-sub">{f.sub}</span>
            </button>
          ))}
        </div>
      </Section>

      <div className="s-save-row">
        <button className="s-btn-save" onClick={() => {}}>
          <Icons.Save />
          Apply Changes
        </button>
        <span className="s-save-note">Some changes may require a page refresh.</span>
      </div>
    </div>
  );
}

// ─── Privacy Tab ──────────────────────────────────────────────────────────────
function PrivacyTab() {
  const [prefs, setPrefs] = useState({
    profileVisible: true,
    showToRecruiters: true,
    dataSharing: false,
    analyticsOpt: true,
  });
  const [toast, setToast] = useState(null);
  const [showDelete, setShowDelete] = useState(false);

  const set = (key) => (val) => setPrefs((p) => ({ ...p, [key]: val }));

  return (
    <div className="s-tab-content">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <Section title="Visibility" description="Control who can see your profile.">
        <FieldRow label="Public profile" hint="Recruiters can find you via search">
          <Toggle checked={prefs.profileVisible} onChange={set("profileVisible")} />
        </FieldRow>
        <FieldRow label="Show to recruiters" hint="Appear in recruiter candidate pools">
          <Toggle checked={prefs.showToRecruiters} onChange={set("showToRecruiters")} />
        </FieldRow>
      </Section>

      <Section title="Data & Analytics" description="Manage how your data is used.">
        <FieldRow label="Usage analytics" hint="Help us improve HireBot with anonymised data">
          <Toggle checked={prefs.analyticsOpt} onChange={set("analyticsOpt")} />
        </FieldRow>
        <FieldRow label="Third-party data sharing" hint="Share anonymised data with job board partners">
          <Toggle checked={prefs.dataSharing} onChange={set("dataSharing")} />
        </FieldRow>
      </Section>

      <Section title="Data Export" description="Download a copy of all your HireBot data.">
        <div className="s-data-row">
          <div>
            <div className="s-field__label">Export your data</div>
            <div className="s-field__hint">Includes profile, applications, and AI analysis history</div>
          </div>
          <button className="s-btn-outline">
            Request Export <Icons.ChevRight />
          </button>
        </div>
      </Section>

      <Section title="Danger Zone" description="Irreversible actions — proceed with caution.">
        <div className="s-danger-zone">
          <div>
            <div className="s-field__label" style={{ color: "#f87171" }}>Delete Account</div>
            <div className="s-field__hint">Permanently remove your account and all data. This cannot be undone.</div>
          </div>
          {!showDelete ? (
            <button className="s-btn-danger" onClick={() => setShowDelete(true)}>
              <Icons.Trash /> Delete Account
            </button>
          ) : (
            <div className="s-delete-confirm">
              <p>Are you absolutely sure? Type <strong>DELETE</strong> to confirm.</p>
              <Input value="" onChange={() => {}} placeholder="Type DELETE" />
              <div style={{ display: "flex", gap: 8 }}>
                <button className="s-btn-danger">Confirm Delete</button>
                <button className="s-btn-outline" onClick={() => setShowDelete(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Settings() {
  const navigate  = useNavigate();
  const [tab, setTab] = useState("profile");
  const [user, setUser] = useState(null);

  useEffect(() => {
    ax.get("/api/auth/me")
      .then((r) => setUser(r.data.user))
      .catch(() => navigate("/login"));
  }, []);

  const onNav = (id) => navigate(`/${id}`);
  const onLogout = () => ax.get("/api/auth/logout").finally(() => navigate("/login"));

  const activeTab = TABS.find((t) => t.id === tab);

  return (
    <div className="s-layout">
      <Sidebar user={user} />

      <div className="s-main">
        {/* Topbar */}
        <header className="s-topbar">
          <div>
            <div className="s-topbar__title">Settings</div>
            <div className="s-topbar__sub">Manage your account, security and preferences</div>
          </div>
        </header>

        <div className="s-body">
          {/* Left settings nav */}
          <aside className="s-nav">
            <div className="s-nav__label">Account</div>
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`s-nav-item ${tab === t.id ? "s-nav-item--active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                <span className="s-nav-item__icon">{t.icon}</span>
                <span>{t.label}</span>
                <Icons.ChevRight />
              </button>
            ))}
          </aside>

          {/* Right content */}
          <div className="s-content">
            <div className="s-content__header">
              <div className="s-content__icon">{activeTab?.icon}</div>
              <div>
                <div className="s-content__title">{activeTab?.label}</div>
                <div className="s-content__sub">
                  {tab === "profile"       && "Your personal information and public presence"}
                  {tab === "security"      && "Password, sessions, and account protection"}
                  {tab === "notifications" && "Control when and how HireBot contacts you"}
                  {tab === "appearance"    && "Customise the look and feel of the app"}
                  {tab === "privacy"       && "Manage your privacy and data settings"}
                </div>
              </div>
            </div>

            {tab === "profile"       && <ProfileTab user={user} />}
            {tab === "security"      && <SecurityTab />}
            {tab === "notifications" && <NotificationsTab />}
            {tab === "appearance"    && <AppearanceTab />}
            {tab === "privacy"       && <PrivacyTab />}
          </div>
        </div>
      </div>
    </div>
  );
}