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

    const scanType = req.body.type || "fridge"; // "fridge" or "bill"

    // Enforce bill/receipt scanning limit (Premium only)
    if (scanType === "bill" && !user.isPremium) {
      return res.status(403).json({
        success: false,
        message: "Tính năng quét hóa đơn chỉ dành cho tài khoản Premium. Vui lòng nâng cấp!",
        premiumRequired: true
      });
    }

    // Enforce 3 scans per week limit for Free tier
    if (!user.isPremium) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentScans = (user.scanHistory || []).filter(date => new Date(date) >= sevenDaysAgo);

      if (recentScans.length >= 3) {
        return res.status(403).json({
          success: false,
          message: "Bạn đã dùng hết giới hạn 3 lượt quét miễn phí trong tuần này. Vui lòng nâng cấp Premium để quét không giới hạn!",
          limitReached: true
        });
      }

      // Record this scan
      user.scanHistory = [...recentScans, new Date()];
      user.premiumUsageCount += 1;
      await user.save();
    } else {
      user.scanHistory = [...(user.scanHistory || []), new Date()];
      await user.save();
    }

    // 1. Detect ingredients via AI
    const result = await visionService.detectLabels(req.file.buffer, scanType);
    
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
        const shelfLifeDays = Number(item.shelfLifeDays) || 7;
        const expiryDate = new Date(Date.now() + shelfLifeDays * 24 * 60 * 60 * 1000);

        const newItem = await Pantry.create({
          user: req.userId,
          name: item.name,
          category: mapCategory(item.category),
          quantity: item.quantity || 1,
          unit: item.unit || "pcs",
          emoji: item.emoji || "📦",
          expiryDate: expiryDate
        });
        savedItems.push(newItem);
      }
    }

    // Usage limit has already been validated and incremented before processing scan


    // 3. Get Recommendations using Hybrid Logic
    const recipeService = require("../services/recipe.service");
    const dbRecommendations = await recipeService.getRecommendations(req.userId);
    
    let finalRecipes = [];
    const bestMatchRatio = dbRecommendations.length > 0 ? (dbRecommendations[0].matchPercentage || 0) : 0;
    
    if (bestMatchRatio >= 75) {
      // Đủ tốt! Trả về kết quả từ DB luôn, không cần tốn tiền gọi Gemini
      console.log(`[Hybrid] DB match is ${bestMatchRatio}%. Using DB suggestions.`);
      finalRecipes = dbRecommendations.slice(0, 4);
    } else {
      // Gọi Hybrid AI
      console.log(`[Hybrid] DB match is only ${bestMatchRatio}%. Calling Gemini Hybrid...`);
      const userIngredients = savedItems.map(i => i.name);
      try {
        const hybridRecipes = await recipeService.getHybridSuggestions(userIngredients, dbRecommendations, req.userId);
        finalRecipes = hybridRecipes;
        
        // Bước 3 (Nâng cao): Lưu các công thức mới vào DB ở chế độ chạy ngầm
        recipeService.saveNewRecipesToDB(hybridRecipes, req.userId).catch(e => console.error(e));
        
      } catch (aiErr) {
        console.error("Hybrid AI failed, fallback to DB:", aiErr);
        finalRecipes = dbRecommendations.slice(0, 4);
      }
    }

    res.json({
      success: true,
      message: `Đã phát hiện và thêm ${savedItems.length} món vào tủ lạnh!`,
      type: result.type,
      data: savedItems,
      recipes: finalRecipes, // Instant suggestions or AI generated
      usageLeft: user.isPremium ? 'Unlimited' : Math.max(0, user.premiumLimit - (user.scanHistory || []).length)
    });
  } catch (error) {
    console.error("Vision API Error:", error);
    next(error);
  }
});

module.exports = router;
