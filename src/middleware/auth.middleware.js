const jwtUtils = require("../utils/jwt.utils");

const authMiddleware = (req, res, next) => {
  try {
    // Lấy token từ header Authorization (định dạng: Bearer <token>)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Không tìm thấy token xác thực" });
    }

    const token = authHeader.split(" ")[1];
    
    // Giải mã và xác thực token
    const decoded = jwtUtils.verifyToken(token);
    
    // Gắn userId vào request để các controller sử dụng
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

module.exports = authMiddleware;
