const MealPlan = require("../models/MealPlan");
const Shopping = require("../models/Shopping");

exports.getOverview = async (req, res, next) => {
  try {
    const userId = req.userId;
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayIso = `${year}-${month}-${day}`;

    // 1. Get today's nutrition from Meal Plan
    const todayMeals = await MealPlan.find({ 
      user: userId, 
      date: todayIso 
    }).populate("recipe");

    let totalCalories = 0;
    let totalProtein = 0;

    todayMeals.forEach(item => {
      if (item.recipe) {
        totalCalories += item.recipe.calories || 0;
        totalProtein += item.recipe.protein || 0;
      }
    });

    // 2. Get top 4 grocery items
    const recentGroceries = await Shopping.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(4);

    res.json({
      success: true,
      data: {
        nutrition: {
          calories: {
            current: totalCalories,
            goal: 2000
          },
          protein: {
            current: totalProtein,
            goal: 80
          }
        },
        groceries: recentGroceries
      }
    });
  } catch (error) {
    next(error);
  }
};
