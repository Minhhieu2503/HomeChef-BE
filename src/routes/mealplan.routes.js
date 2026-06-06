const express = require("express");
const router = express.Router();
const mealPlanController = require("../controllers/mealplan.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Apply authentication middleware to all meal plan routes
router.use(authMiddleware);

router.get("/", mealPlanController.getByDateRange);
router.post("/generate-ai", mealPlanController.generateAIMealPlan);
router.post("/", mealPlanController.assignMeal);
router.delete("/:id", mealPlanController.removeMeal);

module.exports = router;
