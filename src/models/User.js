const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "locked"],
      default: "active",
    },
    dietaryPreferences: {
      type: [String],
      default: []
    },
    healthGoal: {
      type: String,
      default: "balanced"
    },
    calorieGoal: {
      type: Number,
      default: 2000
    },
    allergies: {
      type: [String],
      default: []
    },
    completedMealsCount: {
      type: Number,
      default: 0
    },
    streakDays: {
      type: Number,
      default: 0
    },
    savedRecipes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe'
    }],
    isPremium: {
      type: Boolean,
      default: false
    },
    premiumUsageCount: {
      type: Number,
      default: 0
    },
    premiumLimit: {
      type: Number,
      default: 3
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
