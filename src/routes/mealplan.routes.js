const express = require("express");
const router = express.Router();
const mealPlanController = require("../controllers/mealplan.controller");

router.get("/", mealPlanController.getByDateRange);
router.post("/", mealPlanController.assignMeal);
router.delete("/:id", mealPlanController.removeMeal);

module.exports = router;
