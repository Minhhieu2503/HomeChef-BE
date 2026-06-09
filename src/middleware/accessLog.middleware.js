const AccessLog = require("../models/AccessLog");
const jwtUtils = require("../utils/jwt.utils");

const accessLogMiddleware = (req, res, next) => {
  try {
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwtUtils.verifyToken(token);
        userId = decoded.id;
      } catch (e) {
        // Ignore token errors for logging purposes
      }
    }

    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || "";

    // Log only relevant API requests, ignore OPTIONS and health check
    if (req.method !== "OPTIONS" && !req.originalUrl.includes("/api/health")) {
      AccessLog.create({
        user: userId,
        ipAddress,
        userAgent: req.headers["user-agent"] || "",
        path: req.originalUrl || req.url,
        method: req.method,
      }).catch(err => {
        console.error("Failed to save access log:", err);
      });
    }
  } catch (error) {
    console.error("Access Log Middleware Error:", error);
  }
  next();
};

module.exports = accessLogMiddleware;
