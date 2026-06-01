const mongoose = require("mongoose");

const familySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Gia đình của tôi",
      trim: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    maxMembers: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Family", familySchema);
