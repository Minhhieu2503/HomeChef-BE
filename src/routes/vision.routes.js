const express = require("express");
const router = express.Router();
const multer = require("multer");
const visionService = require("../services/vision.service");
const authMiddleware = require("../middleware/auth.middleware");
const Pantry = require("../models/Pantry");

// Configure multer to use Memory Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // limit to 10MB
  }
});

const User = require("../models/User");

router.post("/scan", authMiddleware, upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file uploaded." });
    }

    // --- Premium Check ---
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.isPremium && user.premiumUsageCount >= user.premiumLimit) {
      return res.status(403).json({ 
        success: false, 
        message: "Bạn đã hết lượt dùng thử tính năng cao cấp. Vui lòng nâng cấp tài khoản!",
        limitReached: true
      });
    }

    // 1. Detect ingredients via AI
    const result = await visionService.detectLabels(req.file.buffer);
    
    // 2. Automatically add to Pantry if requested (or just return results)
    const savedItems = [];
    if (result.ingredients && result.ingredients.length > 0) {
      for (const item of result.ingredients) {
        const newItem = await Pantry.create({
          user: req.userId,
          name: item.name,
          category: item.category || "Other",
          quantity: item.quantity || 1,
          unit: item.unit || "pcs",
          emoji: item.emoji || "📦"
        });
        savedItems.push(newItem);
      }
    }

    // --- Increment Usage ---
    if (!user.isPremium) {
      user.premiumUsageCount += 1;
      await user.save();
    }

    res.json({
      success: true,
      message: `Đã phát hiện và thêm ${savedItems.length} món vào tủ lạnh!`,
      type: result.type,
      data: savedItems,
      usageLeft: user.isPremium ? 'Unlimited' : (user.premiumLimit - user.premiumUsageCount)
    });
  } catch (error) {
    console.error("Vision API Error:", error);
    next(error);
  }
});

module.exports = router;
