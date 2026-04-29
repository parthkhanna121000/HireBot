const express = require("express");
const { authUser } = require("../middlewares/auth.middleware");
const {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notification.controller");

const notificationRouter = express.Router();

// All notification routes require auth
notificationRouter.use(authUser);

notificationRouter.get("/", getNotifications);
notificationRouter.post("/create", createNotification);
notificationRouter.patch("/read-all", markAllAsRead); // ← must be before /:id
notificationRouter.patch("/:id/read", markAsRead);
notificationRouter.delete("/:id", deleteNotification);

module.exports = notificationRouter;
