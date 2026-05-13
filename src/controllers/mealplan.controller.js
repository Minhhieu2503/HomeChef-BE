const mealPlanService = require("../services/mealplan.service");

exports.getByDateRange = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ success: false, message: "Start and End dates required" });
    }
    const items = await mealPlanService.getByDateRange(req.userId, start, end);
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

exports.assignMeal = async (req, res, next) => {
  try {
    const item = await mealPlanService.assignMeal(req.userId, req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.removeMeal = async (req, res, next) => {
  try {
    await mealPlanService.removeMeal(req.params.id);
    res.json({ success: true, message: "Meal removed from plan" });
  } catch (error) {
    next(error);
  }
};
