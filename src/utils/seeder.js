const mongoose = require("mongoose");
const Recipe = require("../models/Recipe");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const defaultRecipes = [
  {
    title: "Trứng chiên thịt băm",
    description: "Món ăn đơn giản, đưa cơm cho mọi gia đình Việt với vị ngọt của thịt băm và độ béo ngậy của trứng.",
    ingredients: [
      { name: "Trứng gà", quantity: "3 quả" },
      { name: "Thịt heo băm", quantity: "100g" },
      { name: "Hành lá", quantity: "2 nhánh" },
      { name: "Tỏi", quantity: "2 tép" },
      { name: "Nước mắm", quantity: "1 muỗng cà phê" },
      { name: "Hạt nêm", quantity: "1/2 muỗng cà phê" }
    ],
    steps: [
      { order: 1, instruction: "Hành lá rửa sạch, thái nhỏ. Tỏi băm nhuyễn." },
      { order: 2, instruction: "Đập trứng vào tô, thêm thịt băm, hành lá, nước mắm, hạt nêm và một chút tiêu, đánh đều cho tan gia vị." },
      { order: 3, instruction: "Phi thơm tỏi băm với dầu ăn trên chảo nóng." },
      { order: 4, instruction: "Đổ hỗn hợp trứng thịt vào chảo, chiên ở lửa vừa cho đến khi chín vàng đều hai mặt." }
    ],
    cookTime: 15,
    calories: 280,
    protein: 18,
    fat: 20,
    carbs: 2,
    category: "main",
    difficulty: "Easy",
    image: "https://images.unsplash.com/photo-1598214886806-c87b2a370944?w=400"
  },
  {
    title: "Canh chua cá hồi dưa cải",
    description: "Sự kết hợp hoàn hảo giữa cá hồi béo ngậy và vị chua thanh mát của dưa cải muối chua ngọt.",
    ingredients: [
      { name: "Cá hồi", quantity: "300g" },
      { name: "Dưa cải muối", quantity: "1 bát" },
      { name: "Cà chua", quantity: "2 quả" },
      { name: "Tỏi", quantity: "3 tép" },
      { name: "Hành tây", quantity: "1/2 củ" },
      { name: "Hành lá", quantity: "2 nhánh" },
      { name: "Nước mắm", quantity: "2 muỗng canh" },
      { name: "Đường", quantity: "1 muỗng canh" }
    ],
    steps: [
      { order: 1, instruction: "Cá hồi rửa sạch cắt miếng vừa ăn. Dưa cải vắt bớt nước chua. Cà chua bổ múi cau. Tỏi băm nhỏ." },
      { order: 2, instruction: "Phi thơm tỏi băm trên nồi, cho cà chua và dưa cải vào xào sơ khoảng 3 phút." },
      { order: 3, instruction: "Đổ thêm 800ml nước vào nồi đun sôi. Nêm nước mắm, đường cho vừa vị chua ngọt." },
      { order: 4, instruction: "Cho cá hồi vào đun sôi tiếp 5-7 phút cho cá chín tới, rắc hành lá thái nhỏ lên trên rồi tắt bếp." }
    ],
    cookTime: 25,
    calories: 290,
    protein: 24,
    fat: 16,
    carbs: 7,
    category: "soup",
    difficulty: "Medium",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400"
  },
  {
    title: "Đùi gà hầm bí đỏ",
    description: "Món ăn vô cùng bổ dưỡng cho sức khỏe, đùi gà mềm thơm hòa quyện với bí đỏ bùi ngọt.",
    ingredients: [
      { name: "Đùi gà", quantity: "2 cái" },
      { name: "Bí đỏ mini", quantity: "1 quả" },
      { name: "Hành tây", quantity: "1/2 củ" },
      { name: "Tỏi", quantity: "3 tép" },
      { name: "Gừng", quantity: "1 lát nhỏ" },
      { name: "Hạt nêm", quantity: "1 muỗng canh" },
      { name: "Nước tương", quantity: "1 muỗng canh" }
    ],
    steps: [
      { order: 1, instruction: "Đùi gà rửa sạch, khía nhẹ để ngấm gia vị. Bí đỏ gọt vỏ cắt miếng vuông vừa ăn. Tỏi băm nhuyễn." },
      { order: 2, instruction: "Ướp đùi gà với tỏi băm, hạt nêm, nước tương và lát gừng trong 15 phút." },
      { order: 3, instruction: "Cho gà vào nồi xào săn lại rồi đổ nước xấp mặt gà, đun sôi rồi hạ nhỏ lửa hầm trong 15 phút." },
      { order: 4, instruction: "Thêm bí đỏ vào hầm tiếp 10 phút đến khi bí đỏ và thịt gà chín mềm thơm ngon." }
    ],
    cookTime: 35,
    calories: 320,
    protein: 26,
    fat: 14,
    carbs: 18,
    category: "main",
    difficulty: "Medium",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400"
  },
  {
    title: "Cá ngừ kho xoài xanh",
    description: "Cá ngừ đại dương kho đậm vị kết hợp với xoài xanh chua giòn tạo cảm giác lạ miệng cực kỳ cuốn cơm.",
    ingredients: [
      { name: "Cá ngừ", quantity: "400g" },
      { name: "Xoài", quantity: "1 quả" },
      { name: "Tỏi", quantity: "3 tép" },
      { name: "Hành tây", quantity: "1/2 củ" },
      { name: "Ớt", quantity: "1 quả" },
      { name: "Nước mắm", quantity: "3 muỗng canh" },
      { name: "Nước hàng", quantity: "1 muỗng canh" },
      { name: "Đường", quantity: "1.5 muỗng canh" }
    ],
    steps: [
      { order: 1, instruction: "Cá ngừ rửa sạch, chiên sơ 2 mặt cho săn chắc. Xoài xanh gọt vỏ thái sợi hoặc cắt khúc dày." },
      { order: 2, instruction: "Phi thơm tỏi băm, xếp hành tây thái lát xuống đáy nồi kho." },
      { order: 3, instruction: "Đặt cá ngừ lên trên hành tây, đổ nước mắm, đường, nước hàng và một chút nước ấm vào đun sôi." },
      { order: 4, instruction: "Thêm xoài xanh và ớt vào nồi kho rim ở lửa nhỏ trong 20 phút cho nước sệt lại thấm đều vào cá." }
    ],
    cookTime: 30,
    calories: 285,
    protein: 28,
    fat: 9,
    carbs: 16,
    category: "main",
    difficulty: "Medium",
    image: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400"
  },
  {
    title: "Cá hộp sốt cà chua xào hành tây",
    description: "Món ăn siêu nhanh gọn cho những ngày bận rộn nhưng vẫn đảm bảo dinh dưỡng và hương vị thơm ngon ngon lành.",
    ingredients: [
      { name: "Cá hộp sốt cà chua", quantity: "2 lon" },
      { name: "Hành tây", quantity: "1 củ" },
      { name: "Tỏi", quantity: "2 tép" },
      { name: "Hành lá", quantity: "2 nhánh" },
      { name: "Hạt nêm", quantity: "1/2 muỗng cà phê" },
      { name: "Tiêu", quantity: "1/4 muỗng cà phê" }
    ],
    steps: [
      { order: 1, instruction: "Hành tây lột vỏ thái múi cau mỏng. Tỏi băm nhỏ, hành lá cắt khúc." },
      { order: 2, instruction: "Phi thơm tỏi băm với một chút dầu ăn, cho hành tây vào xào nhanh tay trong 1 phút ở lửa lớn." },
      { order: 3, instruction: "Khui cá hộp đổ vào chảo xào chung với hành tây, nêm hạt nêm và đảo nhẹ tay để cá không bị nát vụn." },
      { order: 4, instruction: "Đun liu riu sôi 2 phút cho hành tây thấm sốt cà, rắc hành lá và tiêu lên trên rồi tắt bếp." }
    ],
    cookTime: 10,
    calories: 210,
    protein: 16,
    fat: 11,
    carbs: 9,
    category: "main",
    difficulty: "Easy",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"
  },
  {
    title: "Canh bí đao thịt heo băm",
    description: "Canh bí đao thanh nhiệt cơ thể, nước canh ngọt mát tự nhiên rất thích hợp cho những ngày hè oi bức.",
    ingredients: [
      { name: "Bí đao", quantity: "1 quả" },
      { name: "Thịt heo băm", quantity: "150g" },
      { name: "Tỏi", quantity: "2 tép" },
      { name: "Hành lá", quantity: "2 nhánh" },
      { name: "Hạt nêm", quantity: "1 muỗng canh" },
      { name: "Nước mắm", quantity: "1 muỗng cà phê" }
    ],
    steps: [
      { order: 1, instruction: "Bí đao gọt vỏ, thái miếng mỏng vừa ăn. Hành lá thái nhỏ." },
      { order: 2, instruction: "Ướp thịt băm với chút hạt nêm trong 10 phút. Tỏi phi thơm trong nồi." },
      { order: 3, instruction: "Cho thịt băm vào xào chín săn lại, sau đó đổ 1 lít nước lọc vào đun sôi lên, hớt bọt." },
      { order: 4, instruction: "Thêm bí đao vào đun sôi tiếp 3-5 phút cho bí vừa chín tới, nêm nước mắm và hạt nêm vừa ăn, rắc hành lá tắt bếp." }
    ],
    cookTime: 15,
    calories: 140,
    protein: 12,
    fat: 7,
    carbs: 6,
    category: "soup",
    difficulty: "Easy",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400"
  },
  {
    title: "Canh bí đỏ sườn non",
    description: "Canh ngọt thơm dồi dào dinh dưỡng, bí đỏ chín mềm mịn kết hợp sườn heo ngọt nước.",
    ingredients: [
      { name: "Bí đỏ mini", quantity: "1 quả" },
      { name: "Sườn heo", quantity: "300g" },
      { name: "Hành tây", quantity: "1/2 củ" },
      { name: "Hành lá", quantity: "2 nhánh" },
      { name: "Hạt nêm", quantity: "1 muỗng canh" }
    ],
    steps: [
      { order: 1, instruction: "Sườn heo rửa sạch chần qua nước sôi. Bí đỏ gọt vỏ, cắt miếng vừa ăn." },
      { order: 2, instruction: "Cho sườn vào nồi cùng 1 lít nước và hành tây đun sôi, hạ nhỏ lửa hầm khoảng 20 phút cho sườn mềm ngọt." },
      { order: 3, instruction: "Cho tiếp bí đỏ vào nồi đun sôi thêm 10 phút cho bí đỏ chín mềm." },
      { order: 4, instruction: "Nêm nếm hạt nêm cho vừa miệng, tắt bếp rắc hành lá cắt nhỏ lên trên." }
    ],
    cookTime: 35,
    calories: 340,
    protein: 22,
    fat: 18,
    carbs: 19,
    category: "soup",
    difficulty: "Medium",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400"
  },
  {
    title: "Bí đỏ xào tỏi thơm phức",
    description: "Món xào thanh đạm nhưng thơm lừng mùi tỏi phi, bí đỏ dẻo bùi cực kỳ đưa cơm.",
    ingredients: [
      { name: "Bí đỏ mini", quantity: "1 quả" },
      { name: "Tỏi", quantity: "1 củ" },
      { name: "Hành lá", quantity: "2 nhánh" },
      { name: "Hạt nêm", quantity: "1 muỗng cà phê" },
      { name: "Dầu ăn", quantity: "1 muỗng canh" }
    ],
    steps: [
      { order: 1, instruction: "Bí đỏ gọt vỏ thái lát mỏng vừa ăn. Tỏi lột vỏ đập dập và băm nhỏ." },
      { order: 2, instruction: "Phi thơm 2/3 phần tỏi băm trên chảo nóng với dầu ăn." },
      { order: 3, instruction: "Cho bí đỏ vào xào đều tay, thêm 2 muỗng nước ấm để bí chín mềm mà không bị cháy xém." },
      { order: 4, instruction: "Nêm hạt nêm, xào khoảng 5 phút đến khi bí chín dẻo. Cho phần tỏi băm còn lại vào đảo đều rồi tắt bếp." }
    ],
    cookTime: 12,
    calories: 120,
    protein: 2,
    fat: 5,
    carbs: 18,
    category: "vegetarian",
    difficulty: "Easy",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"
  },
  {
    title: "Thịt ba chỉ kho trứng cút",
    description: "Món ăn quốc dân của ẩm thực Việt, thịt ba chỉ béo ngậy kho mềm rục cùng trứng cút thấm đẫm sốt.",
    ingredients: [
      { name: "Thịt ba chỉ", quantity: "300g" },
      { name: "Trứng cút", quantity: "10 quả" },
      { name: "Tỏi", quantity: "3 tép" },
      { name: "Hành tím", quantity: "2 củ" },
      { name: "Nước mắm", quantity: "3 muỗng canh" },
      { name: "Nước màu", quantity: "1 muỗng cà phê" },
      { name: "Đường", quantity: "1 muỗng canh" }
    ],
    steps: [
      { order: 1, instruction: "Thịt ba chỉ thái miếng vừa ăn. Trứng cút luộc chín bóc vỏ dọn sẵn." },
      { order: 2, instruction: "Ướp thịt với tỏi băm, hành tím băm, nước mắm, nước màu và đường trong 20 phút." },
      { order: 3, instruction: "Xào thịt ba chỉ săn lại rồi đổ nước dừa xấp mặt thịt, kho lửa vừa trong 15 phút." },
      { order: 4, instruction: "Thêm trứng cút vào nồi kho lửa nhỏ thêm 15 phút cho nước sệt lại và trứng cút thấm màu cánh gián đậm đà." }
    ],
    cookTime: 40,
    calories: 460,
    protein: 24,
    fat: 36,
    carbs: 4,
    category: "main",
    difficulty: "Medium",
    image: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400"
  },
  {
    title: "Cá hồi áp chảo bơ tỏi",
    description: "Hương vị cao cấp sang trọng, cá hồi áp chảo thơm giòn vỏ ngoài nhưng bên trong vẫn ẩm mềm mọng nước béo ngậy bơ tỏi.",
    ingredients: [
      { name: "Cá hồi", quantity: "250g" },
      { name: "Bơ lạt", quantity: "20g" },
      { name: "Tỏi", quantity: "4 tép" },
      { name: "Chanh", quantity: "1/2 quả" },
      { name: "Tiêu", quantity: "1/4 muỗng cà phê" },
      { name: "Muối", quantity: "1/3 muỗng cà phê" }
    ],
    steps: [
      { order: 1, instruction: "Cá hồi thấm khô nước, ướp với xíu muối và hạt tiêu trong 10 phút. Tỏi thái lát." },
      { order: 2, instruction: "Đun nóng chảo với xíu dầu ăn, áp chảo cá hồi mỗi mặt khoảng 2-3 phút cho chín vàng đều." },
      { order: 3, instruction: "Cho bơ lạt và tỏi cắt lát vào chảo phi thơm vàng. Rưới đều nước bơ tỏi nóng lên miếng cá hồi." },
      { order: 4, instruction: "Vắt thêm vài giọt nước cốt chanh vào bơ tỏi rồi gắp cá ra đĩa thưởng thức kèm sốt bơ tỏi nóng hổi." }
    ],
    cookTime: 15,
    calories: 390,
    protein: 28,
    fat: 29,
    carbs: 1,
    category: "healthy",
    difficulty: "Medium",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400"
  }
];

const seedRecipesIfNeeded = async () => {
  try {
    const recipeCount = await Recipe.countDocuments();
    if (recipeCount > 0) {
      console.log(`ℹ️ Database already has ${recipeCount} recipes. Skipping auto-seed.`);
      return;
    }

    console.log("🌱 Database is empty. Starting database seeding process...");

    // Find or create default admin/system user
    let adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      adminUser = await User.findOne();
    }
    
    if (!adminUser) {
      console.log("👤 Creating default admin user for recipe authoring...");
      const hashedPassword = await bcrypt.hash("admin123456", 10);
      adminUser = await User.create({
        name: "HomeChef Admin",
        email: "admin@homechef.com",
        password: hashedPassword,
        role: "admin",
        status: "active",
        plan: "premium",
        calorieGoal: 2000
      });
      console.log(`✅ Default admin created: ${adminUser.email}`);
    }

    // Set author field for all recipes
    const recipesToSeed = defaultRecipes.map(recipe => ({
      ...recipe,
      author: adminUser._id
    }));

    await Recipe.insertMany(recipesToSeed);
    console.log(`✅ Successfully seeded ${recipesToSeed.length} authentic Vietnamese recipes into MongoDB!`);
  } catch (error) {
    console.error("❌ Seeding database error:", error);
  }
};

module.exports = { seedRecipesIfNeeded, defaultRecipes };
