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
    const result = await mealPlanService.removeMeal(req.params.id, req.userId);
    if (!result) {
      return res.status(404).json({ success: false, message: "Meal plan not found or unauthorized" });
    }
    res.json({ success: true, message: "Meal removed from plan" });
  } catch (error) {
    next(error);
  }
};

exports.generateAIMealPlan = async (req, res, next) => {
  try {
    const { peopleCount, daysCount, dietMode, prioritizePantry } = req.body;
    
    if (!peopleCount || !daysCount) {
      return res.status(400).json({ success: false, message: "Thiếu số lượng người ăn hoặc số ngày!" });
    }

    const days = parseInt(daysCount, 10);
    if (isNaN(days) || days <= 0 || days > 3) {
      return res.status(400).json({ success: false, message: "Số ngày lên kế hoạch phải từ 1 đến 3 ngày!" });
    }

    const people = parseInt(peopleCount, 10);
    if (isNaN(people) || people <= 0) {
      return res.status(400).json({ success: false, message: "Số người ăn không hợp lệ!" });
    }

    const items = await mealPlanService.generateAIMealPlan(
      req.userId,
      people,
      days,
      dietMode,
      prioritizePantry === true || prioritizePantry === "true"
    );

    res.json({
      success: true,
      message: `Đã tạo thành công kế hoạch ăn uống cho ${people} người trong ${days} ngày!`,
      data: items
    });
  } catch (error) {
    next(error);
  }
};
