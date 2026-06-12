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
    plan: {
      type: String,
      enum: ["free", "premium", "family"],
      default: "free"
    },
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      default: null
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
    scanHistory: {
      type: [Date],
      default: []
    },
    hasGivenFeedback: {
      type: Boolean,
      default: false
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.virtual('isPremium').get(function() {
  return this.plan === 'premium' || this.plan === 'family' || !!this.familyId;
});

module.exports = mongoose.model("User", userSchema);
