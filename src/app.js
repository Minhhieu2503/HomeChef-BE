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
    // Cho phép các request không có Origin (như ứng dụng mobile native hoặc postman)
    if (!origin) return callback(null, true);
    
    // Kiểm tra Origin có nằm trong danh sách cho phép không
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"), false);
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// --------------- Routes ---------------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount route modules here:
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/recipes", require("./routes/recipe.routes"));
app.use("/api/pantry", require("./routes/pantry.routes"));
app.use("/api/vision", require("./routes/vision.routes"));
app.use("/api/shopping", require("./routes/shopping.routes"));
app.use("/api/mealplan", require("./routes/mealplan.routes"));

// --------------- Error Handling ---------------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
