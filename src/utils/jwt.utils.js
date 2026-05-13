const jwt = require("jsonwebtoken");

// Lấy Secret Key từ biến môi trường hoặc dùng mặc định
const JWT_SECRET = process.env.JWT_SECRET || "homechef_secret_key_12345";
const JWT_EXPIRES_IN = "7d"; // Token có giá trị 7 ngày

/**
 * Tạo JWT token cho user
 * @param {Object} payload Dữ liệu đưa vào token (thường là userId)
 * @returns {String} JWT Token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Xác thực JWT token
 * @param {String} token Token cần xác thực
 * @returns {Object} Payload đã được giải mã
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};
