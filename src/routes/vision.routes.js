const express = require("express");
const router = express.Router();
const multer = require("multer");
const visionService = require("../services/vision.service");

// Configure multer to use Memory Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // limit to 5MB
  }
});

router.post("/scan", upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file uploaded." });
    }

    const labels = await visionService.detectLabels(req.file.buffer);
    
    res.json({
      success: true,
      data: labels
    });
  } catch (error) {
    console.error("Vision API Error:", error);
    next(error);
  }
});

module.exports = router;
