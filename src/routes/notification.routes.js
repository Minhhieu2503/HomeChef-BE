const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const Notification = require("../models/Notification");
const { asyncHandler } = require("../utils/asyncHandler");

router.use(authMiddleware);

// GET all notifications of user
router.get("/", asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.userId })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, data: notifications });
}));

// PATCH mark all as read
router.patch("/read-all", asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.userId, isRead: false },
    { isRead: true }
  );
  res.json({ success: true, message: "Đã đánh dấu đọc tất cả thông báo" });
}));

// PATCH mark a notification as read
router.patch("/:id/read", asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { isRead: true },
    { new: true }
  );
  if (!notification) {
    return res.status(404).json({ success: false, message: "Không tìm thấy thông báo" });
  }
  res.json({ success: true, data: notification });
}));

// DELETE a notification
router.delete("/:id", asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!notification) {
    return res.status(404).json({ success: false, message: "Không tìm thấy thông báo" });
  }
  res.json({ success: true, message: "Đã xóa thông báo" });
}));

module.exports = router;
