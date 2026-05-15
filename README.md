# HomeChef Backend API

Hệ thống API backend cho ứng dụng HomeChef, được xây dựng trên nền tảng Node.js và Express.

## 📁 Cấu trúc thư mục (Source)

- `/controllers`: Xử lý logic yêu cầu HTTP.
- `/models`: Định nghĩa lược đồ dữ liệu (Schema) cho MongoDB.
- `/routes`: Định nghĩa các điểm cuối (Endpoints) của API.
- `/services`: Chứa logic nghiệp vụ phức tạp và tích hợp dịch vụ bên thứ ba (AI, Cloudinary).
- `/middleware`: Kiểm soát quyền truy cập và xử lý dữ liệu trung gian.
- `/utils`: Các hàm tiện ích dùng chung.

## 🔑 Các API chính

### 1. Xác thực (Auth) - `/api/auth`
- `POST /register`: Đăng ký tài khoản mới.
- `POST /login`: Đăng nhập hệ thống.
- `POST /google`: Đăng nhập bằng Google.
- `GET /me`: Lấy thông tin người dùng hiện tại.

### 2. Tủ lạnh (Pantry) - `/api/pantry`
- `GET /`: Danh sách nguyên liệu.
- `POST /`: Thêm nguyên liệu mới.
- `PUT /:id`: Cập nhật nguyên liệu.
- `DELETE /:id`: Xóa nguyên liệu.

### 3. Nhận diện AI (Vision) - `/api/vision`
- `POST /analyze`: Tải ảnh lên để Gemini AI phân tích và trả về danh sách nguyên liệu tự động.

### 4. Công thức (Recipes) - `/api/recipes`
- `GET /`: Lấy danh sách công thức.
- `GET /rescue`: Tìm kiếm món ăn dựa trên những gì có trong tủ lạnh.
- `GET /:id`: Xem chi tiết công thức (bao gồm thông tin dinh dưỡng).

## ⚙️ Cấu hình (Environment Variables)

Bạn cần tạo file `.env` với các tham số sau:
- `PORT`: Cổng chạy server (mặc định 5000).
- `MONGODB_URI`: Đường dẫn kết nối MongoDB.
- `JWT_SECRET`: Khóa bí mật cho JWT.
- `GEMINI_API_KEY`: API Key từ Google AI Studio.
- `CLOUDINARY_URL`: Cấu hình cho việc tải ảnh lên Cloudinary.

## 🚀 Cách chạy dự án

1. `npm install`
2. `npm run dev` (Sử dụng nodemon để tự động tải lại khi code thay đổi).
3. `node seed.js` (Để nạp dữ liệu mẫu vào database nếu cần).

---
*Mọi thay đổi về Database Schema cần được cập nhật trong thư mục `/models`.*
