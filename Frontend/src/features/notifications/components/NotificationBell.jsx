import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../services/notifications.api";
import "../styles/notifications.scss";

const ICONS = {
  application: "📋",
  interview:   "🎤",
  payment:     "💳",
  system:      "🔔",
};

const TYPE_LABELS = {
  application: "Application",
  interview:   "Interview",
  payment:     "Payment",
  system:      "System",
};

const TABS = [
  { id: "all",       label: "All" },
  { id: "unread",    label: "Unread" },
  { id: "interview", label: "Interviews" },
];

const drawerVariants = {
  hidden:  { x: "100%", opacity: 0.8 },
  visible: { x: 0,      opacity: 1,   transition: { type: "spring", damping: 28, stiffness: 320 } },
  exit:    { x: "100%", opacity: 0,   transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } },
};

const overlayVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 6 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.2 } }),
};

/* ── helpers ─────────────────────────────────────────────────────────────── */
const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)    return "just now";
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const groupByDate = (items) => {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yest  = new Date(today - 86400000);

  return items.reduce((acc, n) => {
    const d = new Date(n.createdAt);
    let label;
    if (d >= today)      label = "Today";
    else if (d >= yest)  label = "Yesterday";
    else                 label = "Earlier";
    (acc[label] = acc[label] || []).push(n);
    return acc;
  }, {});
};

/* ── component ───────────────────────────────────────────────────────────── */
export default function NotificationBell() {
  const [open,          setOpen]          = useState(false);
  const [activeTab,     setActiveTab]     = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);

  /* fetch */
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data?.notifications ?? []);
      setUnreadCount(data?.unreadCount ?? 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(id);
  }, []);

  /* lock body scroll when drawer is open */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /* actions */
  const handleMarkRead = async (id) => {
    await markAsRead(id);
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteNotification(id);
    const removed = notifications.find((n) => n._id === id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (removed && !removed.isRead) setUnreadCount((c) => Math.max(0, c - 1));
  };

  /* filtered view */
  const filtered = notifications.filter((n) => {
    if (activeTab === "unread")    return !n.isRead;
    if (activeTab === "interview") return n.type === "interview";
    return true;
  });

  const groups = groupByDate(filtered);

  return (
    <>
      {/* ── Bell trigger ──────────────────────────────────────────── */}
      <motion.button
        className={`notif-bell-btn ${open ? "is-open" : ""} ${unreadCount > 0 ? "has-unread" : ""}`}
        onClick={() => setOpen(true)}
        aria-label="Open notifications"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              className="notif-bell-btn__badge"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", damping: 16, stiffness: 400 }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Portal: overlay + drawer ───────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="notif-overlay"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              className="notif-drawer"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="dialog"
              aria-modal="true"
              aria-label="Notifications"
            >
              {/* Header */}
              <div className="nd-header">
                <div className="nd-header__left">
                  <h2 className="nd-header__title">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="nd-header__badge">{unreadCount} unread</span>
                  )}
                </div>
                <div className="nd-header__actions">
                  {unreadCount > 0 && (
                    <button className="nd-mark-all" onClick={handleMarkAll}>
                      Mark all read
                    </button>
                  )}
                  <button
                    className="nd-close"
                    onClick={() => setOpen(false)}
                    aria-label="Close notifications"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Filter tabs */}
              <div className="nd-tabs">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    className={`nd-tab ${activeTab === tab.id ? "is-active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* List */}
              <div className="nd-list">
                {loading && notifications.length === 0 ? (
                  <div className="nd-empty">
                    <div className="nd-empty__spinner" />
                    <p>Loading notifications…</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="nd-empty">
                    <span className="nd-empty__icon">🔕</span>
                    <p>Nothing here yet</p>
                  </div>
                ) : (
                  Object.entries(groups).map(([group, items]) => (
                    <div key={group} className="nd-group">
                      <div className="nd-group__label">{group}</div>
                      {items.map((n, i) => (
                        <motion.div
                          key={n._id}
                          className={`nd-item ${!n.isRead ? "is-unread" : ""}`}
                          custom={i}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          onClick={() => !n.isRead && handleMarkRead(n._id)}
                        >
                          <div className={`nd-item__icon-wrap type-${n.type}`}>
                            {ICONS[n.type] || "🔔"}
                          </div>

                          <div className="nd-item__body">
                            <p className="nd-item__title">{n.title}</p>
                            <p className="nd-item__message">{n.message}</p>
                            <div className="nd-item__meta">
                              <span className="nd-item__time">{timeAgo(n.createdAt)}</span>
                              <span className={`nd-item__type-pill type-${n.type}`}>
                                {TYPE_LABELS[n.type] || n.type}
                              </span>
                            </div>
                          </div>

                          {!n.isRead && <span className="nd-item__dot" />}

                          <button
                            className="nd-item__delete"
                            onClick={(e) => handleDelete(e, n._id)}
                            aria-label="Delete notification"
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}