const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    planId: {
      type: String,
      required: true,
      enum: ["premium", "family"],
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    vnp_TransactionNo: String,
    vnp_ResponseCode: String,
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    paymentDate: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
