const app = require("./src/app");
const { connectDB } = require("./src/config/database");

// --- AUTO-FIX FOR RENDER ENVIRONMENT TYPOS ---
if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes("yqs55P2x8c8rh6S7a")) {
  process.env.MONGODB_URI = process.env.MONGODB_URI.replace("yqs55P2x8c8rh6S7a", "yqs55P2x8c8rh6S7@");
}
if (process.env.VISION_API_KEY && process.env.VISION_API_KEY.startsWith("IzaSyDL0zq")) {
  process.env.VISION_API_KEY = "A" + process.env.VISION_API_KEY;
}
// ---------------------------------------------

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start server
connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  });
});
