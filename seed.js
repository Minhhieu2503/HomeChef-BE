const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./src/models/User");
const Recipe = require("./src/models/Recipe");
const bcrypt = require("bcryptjs");

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Đã kết nối MongoDB để nạp dữ liệu...");

    // 1. Xóa dữ liệu cũ (Tùy chọn - cẩn thận khi dùng)
    // await User.deleteMany({ role: { $ne: "admin" } }); 
    // await Recipe.deleteMany({});

    // 2. Tạo User mẫu (Chef)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    const chef = await User.findOneAndUpdate(
      { email: "chef.hoang@homechef.com" },
      {
        name: "Chef Hoang",
        email: "chef.hoang@homechef.com",
        password: hashedPassword,
        role: "user",
        status: "active",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hoang"
      },
      { upsert: true, new: true }
    );

    const admin = await User.findOne({ role: "admin" });

    // 3. Tạo danh sách Công thức mẫu
    const recipes = [
      {
        title: "Phở Bò Truyền Thống",
        description: "Món ăn quốc hồn quốc túy của Việt Nam với nước dùng thanh ngọt.",
        ingredients: [
          { name: "Bánh phở", quantity: "500g" },
          { name: "Thịt bò thăn", quantity: "200g" },
          { name: "Quế, hồi, thảo quả", quantity: "1 bộ" }
        ],
        steps: [
          { order: 1, instruction: "Ninh xương ống bò trong 8 tiếng." },
          { order: 2, instruction: "Trần bánh phở và xếp thịt lên trên." }
        ],
        image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800",
        cookTime: 480,
        servings: 4,
        category: "main",
        author: chef._id,
        status: "approved"
      },
      {
        title: "Salad Ức Gà Gym",
        description: "Món ăn giàu Protein cho người tập luyện.",
        ingredients: [
          { name: "Ức gà", quantity: "150g" },
          { name: "Xà lách", quantity: "100g" },
          { name: "Sốt mè rang", quantity: "2 muỗng" }
        ],
        steps: [
          { order: 1, instruction: "Áp chảo ức gà cho đến khi chín vàng." },
          { order: 2, instruction: "Trộn cùng rau và nước sốt." }
        ],
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
        cookTime: 20,
        servings: 1,
        category: "appetizer",
        author: chef._id,
        status: "approved"
      },
      {
        title: "Bánh Mì Avocado Healthy",
        description: "Bữa sáng đầy đủ dinh dưỡng với chất béo tốt từ bơ.",
        ingredients: [
          { name: "Bơ sáp", quantity: "1 quả" },
          { name: "Bánh mì đen", quantity: "2 lát" },
          { name: "Trứng chần", quantity: "1 quả" }
        ],
        steps: [
          { order: 1, instruction: "Nghiền nhuyễn bơ và phết lên bánh mì." },
          { order: 2, instruction: "Đặt trứng chần lên trên và rắc tiêu." }
        ],
        image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800",
        cookTime: 10,
        servings: 1,
        category: "main",
        author: chef._id,
        status: "pending"
      }
    ];

    for (const r of recipes) {
      await Recipe.findOneAndUpdate({ title: r.title }, r, { upsert: true });
    }

    console.log("✨ Đã nạp dữ liệu mẫu thành công!");
    process.exit();
  } catch (err) {
    console.error("❌ Lỗi khi nạp dữ liệu:", err);
    process.exit(1);
  }
};

seedData();
