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
const GridIcon     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const BriefcaseIcon= () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>;
const FileTextIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>;
const BotIcon      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg>;
const HistoryIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 0 .5-4.5"/><polyline points="3 3 3 9 9 9"/></svg>;
const CheckIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const SettingsIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06-.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
const LogOutIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const ShieldIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

const CollapseToggleIcon = ({ collapsed }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}>
    <polyline points="11 17 6 12 11 7" />
    <polyline points="18 17 13 12 18 7" />
  </svg>
);

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

export default function Sidebar({ user }) {
  const navigate     = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Default width token value synced with SCSS
  const EXPANDED_WIDTH = 180;

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("hb-sidebar-collapsed") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (collapsed) {
      document.body.classList.add("sidebar-is-collapsed");
      document.body.classList.remove("sidebar-is-expanded");
    } else {
      document.body.classList.add("sidebar-is-expanded");
      document.body.classList.remove("sidebar-is-collapsed");
    }
    try {
      localStorage.setItem("hb-sidebar-collapsed", String(collapsed));
    } catch {
      // ignore
    }
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
    // Automatically reset scroll to top on route change to prevent headers/titles from hiding
    window.scrollTo(0, 0);
  }, [pathname]);

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

  const sidebarContent = (
    <motion.aside
      className={`hb-sidebar ${collapsed ? "hb-sidebar--collapsed" : ""}`}
      animate={{ width: collapsed ? 68 : EXPANDED_WIDTH }}
      transition={{ type: "spring", stiffness: 340, damping: 32, mass: 0.9 }}
    >
      <div className="hb-sidebar__glow" aria-hidden="true" />

      {/* Logo & Collapse Header */}
      <div className="hb-sidebar__logo">
        <div className="hb-sidebar__brand-container" style={{ display: collapsed ? "none" : "flex", alignItems: "center", width: "100%", overflow: "hidden" }}>
          <HireBotLogo size={24} textSize={13} />
        </div>
        {collapsed && (
          <div className="hb-sidebar__brand-icon-only" style={{ margin: "0 auto" }}>
            <HireBotLogo size={24} textSize={0} />
          </div>
        )}

        <div className="hb-sidebar__logo-right">
          {!collapsed && <NotificationBell />}
          <motion.button
            className="hb-sidebar__collapse-btn hb-desktop-only"
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed(!collapsed);
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <CollapseToggleIcon collapsed={collapsed} />
          </motion.button>
          <button
            className="hb-sidebar__close-btn hb-mobile-only"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <MenuIcon open={true} />
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="hb-sidebar__nav" aria-label="Main navigation">
        {NAV_SECTIONS.map((section, sectionIdx) => (
          <div key={section.label} className="hb-sidebar__section">
            {!collapsed && <div className="hb-sidebar__section-label">{section.label}</div>}

            {section.items.map((item, itemIdx) => {
              const active = isActive(item.path);
              const delay = (sectionIdx * section.items.length + itemIdx) * 0.03;

              return (
                <div key={item.path} className="hb-nav-item-wrapper" style={{ position: "relative" }}>
                  <motion.button
                    className={`hb-nav-item ${active ? "hb-nav-item--active" : ""}`}
                    onClick={() => navigate(item.path)}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.25, delay, ease: "easeOut" }}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="hb-nav-item__icon">{item.icon}</span>

                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          className="hb-nav-item__label"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {!collapsed && item.badge && (
                      <span className="hb-nav-item__badge">{item.badge}</span>
                    )}

                    {collapsed && item.badge && (
                      <span className="hb-nav-item__mini-badge" />
                    )}

                    {active && (
                      <motion.span
                        className="hb-nav-item__indicator"
                        layoutId="hb-nav-indicator"
                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      />
                    )}
                  </motion.button>

                  {collapsed && (
                    <div className="hb-nav-tooltip">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {user?.role === "admin" && (
          <div className="hb-sidebar__section">
            {!collapsed && <div className="hb-sidebar__section-label">Management</div>}
            <div className="hb-nav-item-wrapper" style={{ position: "relative" }}>
              <motion.button
                className={`hb-nav-item ${isActive("/admin") ? "hb-nav-item--active" : ""}`}
                onClick={() => navigate("/admin")}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="hb-nav-item__icon"><ShieldIcon /></span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      className="hb-nav-item__label"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    >
                      Admin Dashboard
                    </motion.span>
                  )}
                </AnimatePresence>

                {isActive("/admin") && (
                  <motion.span
                    className="hb-nav-item__indicator"
                    layoutId="hb-nav-indicator"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </motion.button>

              {collapsed && (
                <div className="hb-nav-tooltip">
                  Admin Dashboard
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="hb-sidebar__footer">
        <div className="hb-sidebar__divider" />

        <motion.button
          className="hb-profile"
          onClick={() => navigate("/settings")}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        >
          <div className="hb-profile__avatar">
            {initials(user?.username)}
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                className="hb-profile__info"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              >
                <div className="hb-profile__name">{user?.username || "Account"}</div>
                <div className="hb-profile__role">{roleLabel(user?.role)}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {!collapsed && (
            <motion.span
              className="hb-profile__gear"
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.3 }}
            >
              <SettingsIcon />
            </motion.span>
          )}
        </motion.button>

        <motion.button
          className="hb-logout"
          onClick={handleLogout}
          whileHover={{ color: "#f87171" }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        >
          <LogOutIcon />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              >
                Log out
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );

  return (
    <>
      <div className="hb-mobile-topbar">
        <button
          className="hb-mobile-topbar__menu-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <MenuIcon open={false} />
        </button>
        <HireBotLogo size={24} textSize={14} />
        <NotificationBell />
      </div>

      <div className="hb-sidebar-desktop">
        {sidebarContent}
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="hb-sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileOpen(false)}
            />
            <div className="hb-sidebar-mobile">
              {sidebarContent}
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}