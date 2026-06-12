const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedback.controller");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

// User routes (Authenticated)
router.post("/", authMiddleware, feedbackController.createFeedback);

// Admin routes (Authenticated & Admin)
router.get("/admin", authMiddleware, adminMiddleware, feedbackController.getAllFeedbacks);
router.put("/admin/:id", authMiddleware, adminMiddleware, feedbackController.updateFeedbackStatus);

module.exports = router;
