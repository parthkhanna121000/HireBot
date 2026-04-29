/**
 * SIDEBAR.JSX PATCH
 *
 * Add NotificationBell and PlanBadge to your existing Sidebar.jsx.
 * Find each matching section and insert the code shown.
 */

// ─── ADD THESE IMPORTS at the top of Sidebar.jsx ─────────────────────────────
/*
import NotificationBell from "../notifications/components/NotificationBell";
import PlanBadge        from "./PlanBadge";
*/

// ─── ADD NotificationBell to the top bar of the sidebar ──────────────────────
// Find your sidebar header / top action area and add the bell next to user info:
/*
  <div className="sidebar__top-actions">
    <NotificationBell />
    // ...existing top buttons
  </div>
*/

// ─── ADD PlanBadge near the bottom of the sidebar, above logout ──────────────
/*
  <div className="sidebar__bottom">
    <PlanBadge />
    <button className="sidebar__logout" onClick={handleLogout}>
      Sign Out
    </button>
  </div>
*/

// ─── EXAMPLE: Minimal complete sidebar structure ──────────────────────────────
/*
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/hooks/useAuth";
import NotificationBell from "../notifications/components/NotificationBell";
import PlanBadge        from "./PlanBadge";
import "../shared/sidebar.scss";

export default function Sidebar({ navLinks }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <span className="sidebar__logo">HireBot</span>
        <NotificationBell />              // ← NEW
      </div>

      <nav className="sidebar__nav">
        {navLinks.map((link) => (
          <NavLink key={link.path} to={link.path} className={({ isActive }) =>
            `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
          }>
            {link.icon} {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__bottom">
        <div className="sidebar__user">
          <span className="sidebar__username">{user?.username}</span>
          <span className="sidebar__role">{user?.role}</span>
        </div>
        <PlanBadge />                     // ← NEW
        <button className="sidebar__logout" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
*/
