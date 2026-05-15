const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.get("/overview", authMiddleware, dashboardController.getOverview);

module.exports = router;
