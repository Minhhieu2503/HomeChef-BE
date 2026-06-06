const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const Notification = require("../models/Notification");
const { asyncHandler } = require("../utils/asyncHandler");

const Pantry = require("../models/Pantry");

router.use(authMiddleware);

// GET all notifications of user
router.get("/", asyncHandler(async (req, res) => {
  try {
    const now = new Date();
    const fortyEightHoursLater = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const getDefaultShelfLife = (name) => {
      const lower = (name || "").toLowerCase().trim();
      if (lower.includes("cá") || lower.includes("tôm") || lower.includes("mực") || lower.includes("hải sản")) {
        return 3;
      }
      if (lower.includes("thịt") || lower.includes("gà") || lower.includes("heo") || lower.includes("bò") || lower.includes("sườn") || lower.includes("chả")) {
        return 4;
      }
      if (lower.includes("sữa") || lower.includes("bơ") || lower.includes("phô mai") || lower.includes("sữa chua") || lower.includes("trứng")) {
        return 7;
      }
      if (lower.includes("rau") || lower.includes("xà lách") || lower.includes("hành lá") || lower.includes("ngò") || lower.includes("nấm") || lower.includes("cà chua") || lower.includes("dưa cải") || lower.includes("dưa chuột") || lower.includes("giá đỗ")) {
        return 5;
      }
      if (lower.includes("củ") || lower.includes("cà rốt") || lower.includes("khoai") || lower.includes("bí") || lower.includes("hành tây") || lower.includes("tỏi") || lower.includes("gừng") || lower.includes("xoài") || lower.includes("táo") || lower.includes("cam") || lower.includes("chanh") || lower.includes("dưa cải muối")) {
        return 14;
      }
      if (lower.includes("hộp") || lower.includes("lon") || lower.includes("khô") || lower.includes("mì") || lower.includes("gia vị") || lower.includes("dầu") || lower.includes("mắm") || lower.includes("đường") || lower.includes("muối")) {
        return 180;
      }
      return 7;
    };

    // Find all pantry items of this user
    const pantryItems = await Pantry.find({ user: req.userId });
    
    for (const item of pantryItems) {
      let expiryDate = item.expiryDate;
      if (!expiryDate) {
        // Estimate expiry date based on typical shelf life and creation date
        const shelfLife = getDefaultShelfLife(item.name);
        expiryDate = new Date(new Date(item.createdAt || Date.now()).getTime() + shelfLife * 24 * 60 * 60 * 1000);
      }

      const diffDays = Math.ceil((new Date(expiryDate) - now) / (1000 * 60 * 60 * 24));
      
      // If expired or expiring within 48 hours
      if (diffDays <= 2) {
        let title = "";
        let message = "";
        if (diffDays < 0) {
          title = `Thực phẩm quá hạn! 🚨`;
          message = `Nguyên liệu "${item.name}" (${item.quantity} ${item.unit || 'đv'}) đã quá hạn ${Math.abs(diffDays)} ngày. Hãy dọn dẹp tủ lạnh nhé!`;
        } else if (diffDays === 0) {
          title = `Thực phẩm hết hạn hôm nay! ⚠️`;
          message = `Nguyên liệu "${item.name}" (${item.quantity} ${item.unit || 'đv'}) sẽ hết hạn vào hôm nay. Hãy sử dụng ngay nhé!`;
        } else {
          title = `Thực phẩm sắp hết hạn! ⚠️`;
          message = `Nguyên liệu "${item.name}" (${item.quantity} ${item.unit || 'đv'}) sắp hết hạn trong ${diffDays} ngày tới. Hãy lên lịch sử dụng nhé!`;
        }

        // Avoid creating duplicate notification for same item name under user
        const existingNotif = await Notification.findOne({
          user: req.userId,
          type: "expiry",
          message: { $regex: new RegExp(item.name, "i") }
        });

        if (!existingNotif) {
          await Notification.create({
            user: req.userId,
            title,
            message,
            type: "expiry",
            isRead: false
          });
        }
      }
    }
  } catch (error) {
    console.error("Error generating real-time expiry notifications:", error);
  }

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
