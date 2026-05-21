const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./src/models/User");
const bcrypt = require("bcryptjs");

async function seedChef() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("password123", salt);
  
  await User.findOneAndUpdate(
    { email: "chef@example.com" },
    { 
      name: "HomeChef Demo",
      email: "chef@example.com",
      password: hashedPassword,
      role: "user",
      avatar: "https://images.unsplash.com/photo-1543332164-6e82f355badc?w=100"
    },
    { upsert: true, new: true }
  );
  
  console.log("User chef@example.com created/updated with password123");
  await mongoose.connection.close();
}

seedChef().catch(console.error);
