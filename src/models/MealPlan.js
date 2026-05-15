const mongoose = require("mongoose");

const mealPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: String, // Stores ISO formatted YYYY-MM-DD
    required: true,
  },
  slot: {
    type: String, 
    enum: ["breakfast", "lunch", "dinner", "snack"],
    required: true,
  },
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recipe",
    required: true,
  }
});

module.exports = mongoose.model("MealPlan", mealPlanSchema);
