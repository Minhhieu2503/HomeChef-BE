const mongoose = require("mongoose");

const accessLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    path: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "timestamp", updatedAt: false },
  }
);

module.exports = mongoose.model("AccessLog", accessLogSchema);
