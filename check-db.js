const mongoose = require("mongoose");
const Transaction = require("./src/models/Transaction");
require("dotenv").config();

async function checkTransactions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const transactions = await Transaction.find().sort("-createdAt").limit(10);
    console.log("Recent Transactions:");
    transactions.forEach(t => {
      console.log(`- OrderId: ${t.orderId}, Status: ${t.status}, Amount: ${t.amount}, Created: ${t.createdAt}`);
    });

    const successTotal = await Transaction.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    console.log("\nTotal Success Revenue (DB Aggregate):", successTotal[0]?.total || 0);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkTransactions();
