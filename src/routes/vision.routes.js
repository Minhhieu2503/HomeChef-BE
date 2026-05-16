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
      // Helper function to map Vietnamese AI categories to English Enums
      const mapCategory = (viCategory) => {
        if (!viCategory) return "Other";
        const cat = viCategory.toString().trim().toLowerCase();
        
        // Rau củ / Vegetable
        if (cat.includes("rau") || cat.includes("củ") || cat.includes("nấm") || 
            cat.includes("hành") || cat.includes("tỏi") || cat.includes("ớt") || 
            cat.includes("salad") || cat.includes("cà chua") || cat.includes("dưa leo") || 
            cat.includes("khoai") || cat.includes("măng") || cat.includes("bắp") || cat.includes("bí")) {
          return "Vegetable";
        }
        
        // Trái cây / Fruit
        if (cat.includes("trái") || cat.includes("quả") || cat.includes("cam") || 
            cat.includes("táo") || cat.includes("chuối") || cat.includes("dưa hấu") || 
            cat.includes("nho") || cat.includes("xoài") || cat.includes("dâu") || cat.includes("chanh")) {
          return "Fruit";
        }
        
        // Thịt & Hải sản / Meat (backend uses "Meat" for both)
        if (cat.includes("thịt") || cat.includes("hải sản") || cat.includes("cá") || 
            cat.includes("tôm") || cat.includes("cua") || cat.includes("mực") || 
            cat.includes("gà") || cat.includes("bò") || cat.includes("heo") || cat.includes("lợn") ||
            cat.includes("sườn") || cat.includes("xúc xích") || cat.includes("chả") || cat.includes("ngao")) {
          return "Meat";
        }
        
        // Sữa & Trứng / Dairy
        if (cat.includes("sữa") || cat.includes("trứng") || cat.includes("phô mai") || 
            cat.includes("cheese") || cat.includes("bơ") || cat.includes("yogurt") || cat.includes("váng sữa")) {
          return "Dairy";
        }
        
        // Gia vị / Spice
        if (cat.includes("gia vị") || cat.includes("muối") || cat.includes("đường") || 
            cat.includes("tiêu") || cat.includes("mắm") || cat.includes("tương") || 
            cat.includes("dầu") || cat.includes("giấm") || cat.includes("mì chính") || 
            cat.includes("hạt nêm") || cat.includes("sốt") || cat.includes("ngũ vị hương")) {
          return "Spice";
        }
        
        // Đồ khô, Ngũ cốc, Đồ hộp / Pantry
        if (cat.includes("ngũ cốc") || cat.includes("đồ hộp") || cat.includes("gạo") || 
            cat.includes("mì") || cat.includes("bún") || cat.includes("phở") || 
            cat.includes("bột") || cat.includes("hạt") || cat.includes("đậu") || 
            cat.includes("nui") || cat.includes("đồ khô") || cat.includes("bánh")) {
          return "Pantry";
        }
        
        // Đồ đông lạnh / Freezer
        if (cat.includes("đông lạnh") || cat.includes("kem") || cat.includes("đá")) {
          return "Freezer";
        }
        
        // Đồ uống / Fridge
        if (cat.includes("đồ uống") || cat.includes("nước") || cat.includes("bia") || 
            cat.includes("rượu") || cat.includes("trà") || cat.includes("cà phê") || cat.includes("sinh tố")) {
          return "Fridge";
        }

        return "Other";
      };

      for (const item of result.ingredients) {
        const newItem = await Pantry.create({
          user: req.userId,
          name: item.name,
          category: mapCategory(item.category),
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

    // 3. Get Recommendations (Optional but helpful for immediate feedback)
    const recipeService = require("../services/recipe.service");
    const recommendations = await recipeService.getRecommendations(req.userId);
    const topRecommendations = recommendations.slice(0, 4); // Top 4 for immediate display

    res.json({
      success: true,
      message: `Đã phát hiện và thêm ${savedItems.length} món vào tủ lạnh!`,
      type: result.type,
      data: savedItems,
      recipes: topRecommendations, // Instant suggestions
      usageLeft: user.isPremium ? 'Unlimited' : (user.premiumLimit - user.premiumUsageCount)
    });
  } catch (error) {
    console.error("Vision API Error:", error);
    next(error);
  }
});

module.exports = router;
