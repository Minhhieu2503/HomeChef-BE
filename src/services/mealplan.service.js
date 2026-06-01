const MealPlan = require("../models/MealPlan");
const familyService = require("./family.service");

const getByDateRange = async (userId, startDate, endDate) => {
  const members = await familyService.getFamilyMembers(userId);
  return await MealPlan.find({
    user: { $in: members },
    date: { $gte: startDate, $lte: endDate }
  }).populate("recipe", "title image cookTime calories");
};

const assignMeal = async (userId, data) => {
  const { date, slot, recipeId } = data;
  const members = await familyService.getFamilyMembers(userId);
  
  // Upsert: Update existing slot if present, otherwise create
  return await MealPlan.findOneAndUpdate(
    { user: { $in: members }, date, slot },
    { user: userId, date, slot, recipe: recipeId },
    { upsert: true, new: true, runValidators: true }
  );
};

const removeMeal = async (id, userId) => {
  const members = await familyService.getFamilyMembers(userId);
  return await MealPlan.findOneAndDelete({ _id: id, user: { $in: members } });
};

module.exports = {
  getByDateRange,
  assignMeal,
  removeMeal
};
