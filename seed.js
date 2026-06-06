require("dotenv").config();
const mongoose = require("mongoose");
const { connectDB } = require("./src/config/database");
const { seedRecipesIfNeeded } = require("./src/utils/seeder");

const runManualSeed = async () => {
  try {
    console.log("Starting manual seeder...");
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connected successfully.`);
    
    // Run seeding logic
    await seedRecipesIfNeeded();
    
    console.log("Seeding complete. Closing DB connection...");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

runManualSeed();
