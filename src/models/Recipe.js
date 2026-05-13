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
      enum: ["appetizer", "main", "dessert", "drink", "snack", "other"],
      default: "other",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Recipe", recipeSchema);
