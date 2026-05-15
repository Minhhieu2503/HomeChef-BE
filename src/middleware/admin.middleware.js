const User = require("../models/User");

/**
 * Middleware to check if the user is an admin
 */
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Truy cập bị từ chối. Bạn không có quyền quản trị." 
      });
    }

    next();
  } catch (error) {
    console.error("Admin Middleware Error:", error.message);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi xác thực quyền quản trị" });
  }
};

module.exports = adminMiddleware;
