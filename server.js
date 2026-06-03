const app = require("./src/app");
const { connectDB } = require("./src/config/database");
const cronService = require("./src/services/cron.service");

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start server
connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    
    // Start expiration cron jobs
    cronService.startCronJobs();
  });
});
