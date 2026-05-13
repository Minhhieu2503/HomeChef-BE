const mongoose = require("mongoose");

const shoppingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Item name is required"],
    trim: true,
  },
  quantity: {
    type: String,
    default: "1",
  },
  checked: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Shopping", shoppingSchema);
