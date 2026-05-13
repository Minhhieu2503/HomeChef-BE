require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { errorHandler, notFound } = require("./middlewares/errorHandler");

const app = express();

// --------------- Middleware ---------------
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
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
