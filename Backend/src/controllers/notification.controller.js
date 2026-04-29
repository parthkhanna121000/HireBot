const Notification = require("../models/notification.model");

// ─── GET ALL NOTIFICATIONS FOR USER ──────────────────────────────────────────
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error("[notifications] getNotifications:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// ─── CREATE NOTIFICATION (API endpoint) ──────────────────────────────────────
const createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, link, meta } = req.body;

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      link: link || null,
      meta: meta || {},
    });

    res.status(201).json({ notification });
  } catch (err) {
    console.error("[notifications] createNotification:", err);
    res.status(500).json({ message: "Failed to create notification" });
  }
};

// ─── MARK ONE AS READ ─────────────────────────────────────────────────────────
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { returnDocument: "after" }, // ← FIXED: was { new: true }
    );

    if (!notification)
      return res.status(404).json({ message: "Notification not found" });

    res.json({ notification });
  } catch (err) {
    console.error("[notifications] markAsRead:", err);
    res.status(500).json({ message: "Failed to update notification" });
  }
};

// ─── MARK ALL AS READ ─────────────────────────────────────────────────────────
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true },
    );
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("[notifications] markAllAsRead:", err);
    res.status(500).json({ message: "Failed to update notifications" });
  }
};

// ─── DELETE A NOTIFICATION ───────────────────────────────────────────────────
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!notification)
      return res.status(404).json({ message: "Notification not found" });

    res.json({ message: "Notification deleted" });
  } catch (err) {
    console.error("[notifications] deleteNotification:", err);
    res.status(500).json({ message: "Failed to delete notification" });
  }
};

// ─── INTERNAL HELPER: pushNotification ───────────────────────────────────────
const pushNotification = async ({
  userId,
  type,
  title,
  message,
  link = null,
  meta = {},
}) => {
  try {
    return await Notification.create({
      userId,
      type,
      title,
      message,
      link,
      meta,
    });
  } catch (err) {
    console.error("[notifications] pushNotification failed:", err.message);
    return null;
  }
};

module.exports = {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  pushNotification,
};
