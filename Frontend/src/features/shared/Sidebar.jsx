import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import HireBotLogo from "./Logo";
import NotificationBell from "../notifications/components/NotificationBell";
import "./sidebar.scss";

const ax = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

// ─── Icons ─────────────────────────────────────────────────────────────────────
const GridIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const BriefcaseIcon= () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>;
const FileTextIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>;
const BotIcon      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg>;
const HistoryIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 0 .5-4.5"/><polyline points="3 3 3 9 9 9"/></svg>;
const CheckIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const SettingsIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
const LogOutIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const ShieldIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

// Hamburger Icon
const MenuIcon = ({ open }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </>
    ) : (
      <>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </>
    )}
  </svg>
);

// ─── Nav items ─────────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { path: "/dashboard",       label: "Dashboard",       icon: <GridIcon /> },
      { path: "/jobs",            label: "Browse Jobs",     icon: <BriefcaseIcon />, badge: "12" },
      { path: "/resume-analyzer", label: "Resume Analyzer", icon: <FileTextIcon /> },
    ],
  },
  {
    label: "Prep",
    items: [
      { path: "/interview-prep",    label: "Interview Prep", icon: <BotIcon /> },
      { path: "/interview-history", label: "History",        icon: <HistoryIcon /> },
      { path: "/applications",      label: "Applications",   icon: <CheckIcon />, badge: "4" },
    ],
  },
];

const initials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0] ?? "").join("").toUpperCase() || "?";

const roleLabel = (role) => {
  if (role === "admin") return "Administrator";
  return role === "recruiter" ? "Recruiter" : "Job Seeker";
};

// ─── Animation variants ────────────────────────────────────────────────────────
const sidebarVariants = {
  hidden:  { x: -248, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const itemVariants = (i) => ({
  hidden:  { x: -16, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { delay: 0.1 + i * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
});

// ─── Component ─────────────────────────────────────────────────────────────────
export default function Sidebar({ user }) {
  const navigate     = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    try { await ax.get("/api/auth/logout"); } catch { /* ignore */ }
    navigate("/login");
  };

  const isActive = (path) =>
    path === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === path || pathname.startsWith(path + "/");

  let globalIdx = 0;

  const sidebarContent = (
    <motion.aside
      className="hb-sidebar"
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="hb-sidebar__glow" aria-hidden="true" />

      <div className="hb-sidebar__logo">
        <HireBotLogo size={28} textSize={14} />
        <div className="hb-sidebar__logo-right">
          <NotificationBell />
          {/* Close button - mobile only */}
          <button
            className="hb-sidebar__close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <MenuIcon open={true} />
          </button>
        </div>
      </div>

      <nav className="hb-sidebar__nav" aria-label="Main navigation">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="hb-sidebar__section">
            <div className="hb-sidebar__section-label">{section.label}</div>

            {section.items.map((item) => {
              const active = isActive(item.path);
              const idx    = globalIdx++;

              return (
                <motion.button
                  key={item.path}
                  className={`hb-nav-item ${active ? "hb-nav-item--active" : ""}`}
                  onClick={() => navigate(item.path)}
                  variants={itemVariants(idx)}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ x: 3, transition: { duration: 0.12, ease: "easeOut" } }}
                  whileTap={{ scale: 0.97 }}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="hb-nav-item__icon">{item.icon}</span>
                  <span className="hb-nav-item__label">{item.label}</span>
                  {item.badge && (
                    <span className="hb-nav-item__badge">{item.badge}</span>
                  )}

                  <AnimatePresence>
                    {active && (
                      <motion.span
                        className="hb-nav-item__indicator"
                        layoutId="sidebar-active-pip"
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        exit={{ opacity: 0, scaleY: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        ))}

        {/* ── Admin Section ────────────────────────────────────────────────── */}
        {user?.role === "admin" && (
          <div className="hb-sidebar__section">
            <div className="hb-sidebar__section-label">Management</div>
            <motion.button
              className={`hb-nav-item ${isActive("/admin") ? "hb-nav-item--active" : ""}`}
              onClick={() => navigate("/admin")}
              variants={itemVariants(globalIdx++)}
              initial="hidden"
              animate="visible"
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="hb-nav-item__icon"><ShieldIcon /></span>
              <span className="hb-nav-item__label">Admin Dashboard</span>

              <AnimatePresence>
                {isActive("/admin") && (
                  <motion.span
                    className="hb-nav-item__indicator"
                    layoutId="sidebar-active-pip"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    exit={{ opacity: 0, scaleY: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        )}
      </nav>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <motion.div
        className="hb-sidebar__footer"
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="hb-sidebar__divider" />

        <motion.button
          className="hb-profile"
          onClick={() => navigate("/settings")}
          whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.12 }}
        >
          <div className="hb-profile__avatar">
            {initials(user?.username)}
          </div>
          <div className="hb-profile__info">
            <div className="hb-profile__name">{user?.username || "Account"}</div>
            <div className="hb-profile__role">{roleLabel(user?.role)}</div>
          </div>
          <motion.span
            className="hb-profile__gear"
            whileHover={{ rotate: 60 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <SettingsIcon />
          </motion.span>
        </motion.button>

        <motion.button
          className="hb-logout"
          onClick={handleLogout}
          whileHover={{ x: 3, color: "#f87171" }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.12 }}
        >
          <LogOutIcon />
          <span>Log out</span>
        </motion.button>
      </motion.div>
    </motion.aside>
  );

  return (
    <>
      {/* ── Mobile Top Bar ──────────────────────────────────────────────── */}
      <div className="hb-mobile-topbar">
        <button
          className="hb-mobile-topbar__menu-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <MenuIcon open={false} />
        </button>
        <HireBotLogo size={22} textSize={13} />
        <NotificationBell />
      </div>

      {/* ── Desktop Sidebar (always visible) ───────────────────────────── */}
      <div className="hb-sidebar-desktop">
        {sidebarContent}
      </div>

      {/* ── Mobile Sidebar (drawer) ─────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="hb-sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <div className="hb-sidebar-mobile">
              {sidebarContent}
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}