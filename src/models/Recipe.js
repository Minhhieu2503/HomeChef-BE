const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    ingredients: [
      {
        name: { type: String, required: true },
        quantity: { type: String, required: true },
      },
    ],
    steps: [
      {
        order: { type: Number, required: true },
        instruction: { type: String, required: true },
        image: { type: String, default: "" },
        video: { type: String, default: "" },
      },
    ],
    image: {
      type: String,
      default: "",
    },
    cookTime: {
      type: Number, // in minutes
      default: 0,
    },
    servings: {
      type: Number,
      default: 1,
    },
    category: {
      type: String,
      enum: ["appetizer", "main", "dessert", "drink", "snack", "breakfast", "soup", "salad", "vegetarian", "healthy", "other"],
      default: "other",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    dietaryTags: {
      type: [String],
      default: [],
    },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 }, // in grams
    fat: { type: Number, default: 0 },     // in grams
    carbs: { type: Number, default: 0 },   // in grams
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Recipe", recipeSchema);
