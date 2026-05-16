const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./src/models/User");

async function checkUsers() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");
  
  const users = await User.find({}, "name email role");
  console.log("Users in DB:", users);
  
  const target = await User.findOne({ email: "chef@example.com" });
  if (target) {
    console.log("Found chef@example.com");
  } else {
    console.log("chef@example.com NOT FOUND");
  }
  
  await mongoose.connection.close();
}

checkUsers().catch(console.error);
