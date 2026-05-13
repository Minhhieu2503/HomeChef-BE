require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");
const Recipe = require("./src/models/Recipe");
const Pantry = require("./src/models/Pantry");

const seedData = async () => {
  try {
    console.log("🌱 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected.");

    let admin = await User.findOne({ email: "admin@homechef.com" });
    if (!admin) {
      admin = await User.create({
        name: "Đầu Bếp Admin",
        email: "admin@homechef.com",
        password: "password123",
        role: "admin"
      });
    }

    await Recipe.deleteMany({});
    await Pantry.deleteMany({});
    console.log("🍳 Seeding real food datasets into DB...");

    // 1. Populate REAL Inventory Items (Pantry)
    const initialStock = [
      { name: "Sữa tươi Vinamilk", category: "Fridge", quantity: 1, unit: "lít", emoji: "🥛" },
      { name: "Trứng gà ta", category: "Fridge", quantity: 12, unit: "quả", emoji: "🥚" },
      { name: "Thịt bò thăn", category: "Freezer", quantity: 500, unit: "g", emoji: "🥩" },
      { name: "Gạo thơm Lài", category: "Pantry", quantity: 5, unit: "kg", emoji: "🌾" },
      { name: "Cà chua chín", category: "Fridge", quantity: 4, unit: "quả", emoji: "🍅" },
      { name: "Bánh mì Sandwich", category: "Pantry", quantity: 1, unit: "gói", emoji: "🍞" },
      { name: "Muối tinh", category: "Spices", quantity: 1, unit: "túi", emoji: "🧂" },
      { name: "Tương ớt Chin-su", category: "Spices", quantity: 1, unit: "chai", emoji: "🌶️" },
    ];
    await Pantry.insertMany(initialStock);
    console.log(`📦 Inserted ${initialStock.length} pantry items successfully!`);

    const recipes = [
      {
        title: "Gà Áp Chảo Bơ Tỏi Giòn Rụm",
        description: "Thịt gà mềm mọng bên trong, lớp vỏ áp chảo vàng giòn tan thơm phức mùi bơ tỏi.",
        category: "main",
        cookTime: 35,
        calories: 450,
        servings: 4,
        difficulty: "Dễ",
        image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&q=80",
        author: admin._id,
        ingredients: [
          { name: "Lườn gà", quantity: "500", unit: "g" },
          { name: "Tỏi lý sơn", quantity: "4", unit: "tép" },
          { name: "Bơ lạt", quantity: "2", unit: "muỗng" }
        ],
        steps: [
          { order: 1, instruction: "Rửa sạch thịt gà, dùng khăn giấy thấm thật khô bề mặt để khi chiên da gà sẽ giòn hơn. Ướp với chút muối và tiêu đen xay." },
          { order: 2, instruction: "Làm nóng chảo với một ít dầu ăn, áp mặt da gà xuống trước. Để lửa vừa và không di chuyển trong vòng 5-7 phút đến khi vàng ruộm." },
          { order: 3, instruction: "Lật mặt thịt, cho bơ lạt và tỏi đập dập vào chảo. Nghiêng chảo và dùng thìa múc bơ liên tục tưới lên miếng gà trong 2 phút cuối rồi tắt bếp." }
        ]
      },
      {
        title: "Mì Ý Sốt Kem Cà Chua Truyền Thống",
        description: "Món mỳ kinh điển mang hương vị đậm đà của Ý, chuẩn bị chỉ trong 20 phút.",
        category: "main",
        cookTime: 25,
        calories: 320,
        servings: 2,
        difficulty: "Dễ",
        image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&q=80",
        author: admin._id,
        ingredients: [
          { name: "Mì Spaghetti", quantity: "200", unit: "g" },
          { name: "Cà chua bi", quantity: "15", unit: "quả" },
          { name: "Lá húng quế", quantity: "1", unit: "bó" }
        ],
        steps: [
          { order: 1, instruction: "Đun sôi nồi nước, cho 1 thìa muối rồi luộc mì trong khoảng 8-10 phút cho đến khi chín vừa tới (Al dente), vớt ra để ráo." },
          { order: 2, instruction: "Phi thơm hành tỏi băm, cho cà chua bi vào xào trên lửa lớn cho đến khi cà chua nứt vỏ, tiết ra nước sốt đậm đặc." },
          { order: 3, instruction: "Cho mì và lá húng quế vào đảo đều cùng nước sốt khoảng 1 phút rồi bày ra đĩa, rắc thêm phô mai nếu muốn." }
        ]
      },
      {
        title: "Salad Bơ Xoài Giải Nhiệt Mùa Hè",
        description: "Sự kết hợp thanh mát giữa vị ngọt của xoài chín và độ ngậy béo của quả bơ tươi.",
        category: "appetizer",
        cookTime: 10,
        calories: 240,
        servings: 2,
        difficulty: "Dễ",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
        author: admin._id,
        ingredients: [
          { name: "Bơ chín", quantity: "1", unit: "quả" },
          { name: "Xoài cát", quantity: "1", unit: "quả" },
          { name: "Chanh tươi", quantity: "1/2", unit: "quả" }
        ],
        steps: [
          { order: 1, instruction: "Gọt vỏ bơ và xoài, thái hạt lựu vừa ăn khoảng 2cm. Tránh trộn quá mạnh tay làm bơ bị nát." },
          { order: 2, instruction: "Vắt nước cốt chanh, trộn cùng một chút mật ong, xíu muối và tiêu để tạo hỗn hợp nước sốt." },
          { order: 3, instruction: "Rưới đều nước sốt lên tô bơ xoài, trộn nhẹ nhàng và để lạnh trong ngăn mát 10 phút trước khi ăn." }
        ]
      },
      {
        title: "Phở Bò Hà Nội",
        description: "Hương vị truyền thống Việt Nam với nước dùng thanh ngọt từ xương.",
        category: "main",
        cookTime: 180,
        calories: 450,
        servings: 4,
        difficulty: "Khó",
        image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80",
        author: admin._id,
        ingredients: [
          { name: "Thịt bò thăn", quantity: "300", unit: "g" },
          { name: "Bánh phở", quantity: "500", unit: "g" },
          { name: "Hành tây", quantity: "1", unit: "củ" },
          { name: "Gừng", quantity: "50", unit: "g" }
        ],
        steps: [
          { order: 1, instruction: "Ninh xương bò cùng gừng nướng trong 3 tiếng." },
          { order: 2, instruction: "Trần bánh phở, thái mỏng thịt bò." },
          { order: 3, instruction: "Chan nước dùng nóng lên phở và thêm hành lá." }
        ]
      },
      {
        title: "Ức Gà Nướng Mật Ong",
        description: "Món ăn lý tưởng cho dân tập gym, giàu protein.",
        category: "main",
        cookTime: 25,
        calories: 280,
        servings: 2,
        difficulty: "Dễ",
        image: "https://cellphones.com.vn/sforum/wp-content/uploads/2023/08/cach-lam-ga-nuong-mat-ong.jpg",
        author: admin._id,
        ingredients: [
          { name: "Ức gà", quantity: "400", unit: "g" },
          { name: "Mật ong", quantity: "2", unit: "muỗng" },
          { name: "Dầu hào", quantity: "1", unit: "muỗng" }
        ],
        steps: [
          { order: 1, instruction: "Ướp gà với mật ong và gia vị trong 15 phút." },
          { order: 2, instruction: "Nướng trong lò ở nhiệt độ 180 độ C trong 20 phút." }
        ]
      },
      {
        title: "Salad Hy Lạp Healthy",
        description: "Thanh mát, giàu vitamin, hoàn hảo cho giảm cân.",
        category: "appetizer",
        cookTime: 0,
        calories: 190,
        servings: 1,
        difficulty: "Dễ",
        image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80",
        author: admin._id,
        ingredients: [
          { name: "Cà chua bi", quantity: "100", unit: "g" },
          { name: "Dưa leo", quantity: "1", unit: "quả" },
          { name: "Phô mai Feta", quantity: "50", unit: "g" }
        ],
        steps: [
          { order: 1, instruction: "Rửa sạch và cắt nhỏ dưa leo, cà chua." },
          { order: 2, instruction: "Trộn cùng phô mai và dầu ô liu rồi thưởng thức." }
        ]
      },
      {
        title: "Bún Chả Hà Nội Đậm Vị",
        description: "Chả nướng than thơm lừng kèm nước chấm chua ngọt.",
        category: "main",
        cookTime: 20,
        calories: 550,
        servings: 2,
        difficulty: "Trung bình",
        image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80",
        author: admin._id,
        ingredients: [
          { name: "Thịt heo xay", quantity: "300", unit: "g" },
          { name: "Đu đủ xanh", quantity: "100", unit: "g" },
          { name: "Bún tươi", quantity: "400", unit: "g" }
        ],
        steps: [
          { order: 1, instruction: "Nặn chả và nướng cháy cạnh trên bếp." },
          { order: 2, instruction: "Pha nước chấm đu đủ chua ngọt và dọn ra bàn." }
        ]
      },
      {
        title: "Sinh Tố Bơ Hạt Chia",
        description: "Thức uống bổ dưỡng nhiều chất béo tốt cho sức khỏe.",
        category: "dessert",
        cookTime: 0,
        calories: 310,
        servings: 1,
        difficulty: "Dễ",
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80",
        author: admin._id,
        ingredients: [
          { name: "Bơ", quantity: "1", unit: "quả" },
          { name: "Sữa tươi", quantity: "150", unit: "ml" },
          { name: "Hạt chia", quantity: "1", unit: "muỗng" }
        ],
        steps: [
          { order: 1, instruction: "Xay nhuyễn bơ cùng sữa và đá." },
          { order: 2, instruction: "Rắc hạt chia lên trên cùng." }
        ]
      },
      {
        title: "Bánh Socola Tan Chảy Đậm Vị",
        description: "Món tráng miệng quyến rũ với lớp vỏ bánh nướng chín tới và phần nhân socola lỏng ấm áp bên trong.",
        category: "dessert",
        cookTime: 20,
        calories: 550,
        servings: 2,
        difficulty: "Khó",
        image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&q=80",
        author: admin._id,
        ingredients: [
          { name: "Socola đen", quantity: "100", unit: "g" },
          { name: "Trứng gà", quantity: "2", unit: "quả" },
          { name: "Bột mì đa dụng", quantity: "20", unit: "g" }
        ],
        steps: [
          { order: 1, instruction: "Đun chảy socola đen cùng bơ lạt bằng phương pháp cách thủy hoặc lò vi sóng, khuấy cho mịn mượt hoàn toàn." },
          { order: 2, instruction: "Đánh bông nhẹ trứng gà với đường, rây từ từ bột mì vào hỗn hợp socola đun chảy và trộn theo kiểu 'fold' (nhẹ nhàng từ dưới lên)." },
          { order: 3, instruction: "Đổ bột vào khuôn đã phết bơ, nướng ở nhiệt độ 200°C trong chính xác 8-9 phút để đảm bảo lòng bánh vẫn còn lỏng." }
        ]
      }
    ];

    await Recipe.insertMany(recipes);
    console.log("🚀 Successfully injected 4 full premium Vietnamese recipe datasets!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed operation failed hard:", err.message);
    process.exit(1);
  }
};

seedData();
