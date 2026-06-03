const cron = require("node-cron");
const Pantry = require("../models/Pantry");
const User = require("../models/User");
const sendEmail = require("../utils/email.utils");

const runExpiryCheck = async () => {
  try {
    console.log("[Cron] Bắt đầu quét thực phẩm sắp hết hạn...");
    const now = new Date();
    const fortyEightHoursLater = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // Tìm tất cả thực phẩm hết hạn hoặc sắp hết hạn trong 48h
    const expiringItems = await Pantry.find({
      expiryDate: { $lte: fortyEightHoursLater }
    }).populate("user");

    if (expiringItems.length === 0) {
      console.log("[Cron] Không tìm thấy thực phẩm nào sắp hết hạn.");
      return;
    }

    // Nhóm thực phẩm theo người dùng
    const userGroups = {};
    for (const item of expiringItems) {
      if (!item.user || !item.user.email) continue;
      const userId = item.user._id.toString();
      if (!userGroups[userId]) {
        userGroups[userId] = {
          user: item.user,
          items: []
        };
      }
      userGroups[userId].items.push(item);
    }

    // Gửi email nhắc nhở cho từng người dùng
    for (const userId of Object.keys(userGroups)) {
      const { user, items } = userGroups[userId];
      
      const itemsListHtml = items.map(item => {
        const daysLeft = Math.ceil((new Date(item.expiryDate) - now) / (1000 * 60 * 60 * 24));
        const statusText = daysLeft < 0 
          ? `<span style="color: #ef4444; font-weight: bold;">đã hết hạn từ ${Math.abs(daysLeft)} ngày trước</span>`
          : daysLeft === 0 
            ? `<span style="color: #f97316; font-weight: bold;">sẽ hết hạn hôm nay</span>`
            : `<span style="color: #eab308; font-weight: bold;">sẽ hết hạn trong ${daysLeft} ngày tới</span>`;
            
        return `<li>
          <strong>${item.emoji} ${item.name}</strong> - Số lượng: ${item.quantity} ${item.unit} (${statusText})
        </li>`;
      }).join("");

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f8fafc;">
          <h2 style="color: #ea580c; text-align: center;">🚨 Cảnh Báo Thực Phẩm Sắp Hết Hạn!</h2>
          <p>Xin chào <strong>${user.name || 'Đầu Bếp'}</strong>,</p>
          <p>HomeChef phát hiện một số thực phẩm trong tủ lạnh của bạn sắp hết hạn hoặc đã hết hạn. Hãy sử dụng chúng ngay để tránh lãng phí thực phẩm nhé:</p>
          <ul style="line-height: 1.8; font-size: 15px;">
            ${itemsListHtml}
          </ul>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background-color: #ea580c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 20px; font-weight: bold; display: inline-block;">Mở Tủ Lạnh HomeChef</a>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #64748b; text-align: center;">Đây là email tự động từ hệ thống quản lý tủ lạnh thông minh HomeChef.</p>
        </div>
      `;

      console.log(`[Cron] Đang gửi email nhắc nhở hết hạn đến: ${user.email}`);
      await sendEmail({
        email: user.email,
        subject: "[HomeChef] Cảnh báo thực phẩm sắp hết hạn 🚨",
        html: htmlContent,
        message: `Chào ${user.name || 'Đầu Bếp'}, một số thực phẩm trong tủ lạnh của bạn sắp hết hạn. Vui lòng vào app kiểm tra.`
      });
    }
    console.log("[Cron] Hoàn thành gửi email nhắc nhở hết hạn.");
  } catch (error) {
    console.error("[Cron] Lỗi khi chạy tác vụ nhắc nhở hết hạn:", error);
  }
};

const startCronJobs = () => {
  // Chạy định kỳ vào lúc 08:00 sáng hàng ngày
  cron.schedule("0 8 * * *", () => {
    runExpiryCheck();
  });
  console.log("[Cron] Cron jobs đã được đăng ký (Hằng ngày vào lúc 08:00)");
};

module.exports = {
  startCronJobs,
  runExpiryCheck
};
