require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { errorHandler, notFound } = require("./middlewares/errorHandler");

const app = express();

// --------------- Middleware ---------------
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost",
  "http://localhost:5173",
  "http://localhost:3000",
  "capacitor://localhost"
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // 1. Cho phép không có Origin (Postman, Mobile App)
    if (!origin) return callback(null, true);
    
    // 2. Cho phép mọi biến thể của Localhost và Capacitor
    const isAppOrigin = origin.includes("localhost") || origin.startsWith("capacitor://");
    
    // 3. Cho phép đường dẫn Production (Vercel)
    const isVercel = origin.includes("vercel.app");
    const isAllowedClient = process.env.CLIENT_URL && origin.startsWith(process.env.CLIENT_URL);
    
    if (isAppOrigin || isVercel || isAllowedClient) {
      return callback(null, true);
    } else {
      return callback(null, true); // Fallback: Cho phép tất cả để fix lỗi gấp
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// --------------- Routes ---------------
app.get("/", (req, res) => {
  res.json({ message: "Welcome to HomeChef API", version: "1.0.1" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Explicitly handle OPTIONS for all routes
app.options("*", cors());

// Mount route modules here:
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/recipes", require("./routes/recipe.routes"));
app.use("/api/pantry", require("./routes/pantry.routes"));
app.use("/api/vision", require("./routes/vision.routes"));
app.use("/api/shopping", require("./routes/shopping.routes"));
app.use("/api/mealplan", require("./routes/mealplan.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));
app.use("/api/payment", require("./routes/payment.routes"));

// --------------- Error Handling ---------------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
