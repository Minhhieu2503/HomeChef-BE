const mongoose = require("mongoose");

const pantrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Item name is required"],
    trim: true,
  },
  category: {
    type: String,
    enum: ["Fridge", "Pantry", "Freezer", "Spices", "Other", "Meat", "Vegetable", "Fruit", "Dairy", "Spice"],
    default: "Other",
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  unit: {
    type: String,
    default: "pcs",
  },
  expiryDate: {
    type: Date,
  },
  emoji: {
    type: String,
    default: "📦",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Pantry", pantrySchema);
