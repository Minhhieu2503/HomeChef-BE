const mongoose = require("mongoose");
const User = require("./src/models/User");
const Recipe = require("./src/models/Recipe");
const dotenv = require("dotenv");
dotenv.config();

const checkDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const userCount = await User.countDocuments();
  const recipeCount = await Recipe.countDocuments();
  const users = await User.find().limit(2);
  
  console.log("User Count:", userCount);
  console.log("Recipe Count:", recipeCount);
  console.log("Sample Users:", JSON.stringify(users, null, 2));
  process.exit();
};

checkDB();
