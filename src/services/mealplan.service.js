const MealPlan = require("../models/MealPlan");

const getByDateRange = async (userId, startDate, endDate) => {
  return await MealPlan.find({
    user: userId,
    date: { $gte: startDate, $lte: endDate }
  }).populate("recipe", "title image cookTime calories");
};

const assignMeal = async (userId, data) => {
  const { date, slot, recipeId } = data;
  
  // Upsert: Update existing slot if present, otherwise create
  return await MealPlan.findOneAndUpdate(
    { user: userId, date, slot },
    { user: userId, date, slot, recipe: recipeId },
    { upsert: true, new: true, runValidators: true }
  );
};

const removeMeal = async (id, userId) => {
  return await MealPlan.findOneAndDelete({ _id: id, user: userId });
};

module.exports = {
  getByDateRange,
  assignMeal,
  removeMeal
};
