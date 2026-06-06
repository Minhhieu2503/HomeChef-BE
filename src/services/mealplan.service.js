const MealPlan = require("../models/MealPlan");
const User = require("../models/User");
const Pantry = require("../models/Pantry");
const Recipe = require("../models/Recipe");
const familyService = require("./family.service");
const fetch = require("node-fetch");

const getByDateRange = async (userId, startDate, endDate) => {
  const members = await familyService.getFamilyMembers(userId);
  return await MealPlan.find({
    user: { $in: members },
    date: { $gte: startDate, $lte: endDate }
  }).populate("recipe", "title image cookTime calories");
};

const assignMeal = async (userId, data) => {
  const { date, slot, recipeId } = data;
  const members = await familyService.getFamilyMembers(userId);
  
  // Upsert: Update existing slot if present, otherwise create
  return await MealPlan.findOneAndUpdate(
    { user: { $in: members }, date, slot },
    { user: userId, date, slot, recipe: recipeId },
    { upsert: true, new: true, runValidators: true }
  );
};

const removeMeal = async (id, userId) => {
  const members = await familyService.getFamilyMembers(userId);
  return await MealPlan.findOneAndDelete({ _id: id, user: { $in: members } });
};

const generateAIMealPlan = async (userId, peopleCount, daysCount, dietMode, prioritizePantry) => {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) throw new Error("GEMINI_API_KEY is missing in environment variables");

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Determine health goal / diet mode
  let healthGoal = user.healthGoal || "balanced";
  if (user.isPremium && dietMode) {
    healthGoal = dietMode;
  }

  // Fetch pantry items to prioritize
  let pantryList = [];
  if (prioritizePantry) {
    const pantryItems = await Pantry.find({ user: userId });
    pantryList = pantryItems.map(
      p => `- ${p.name} (Số lượng: ${p.quantity} ${p.unit}, HSD: ${p.expiryDate ? new Date(p.expiryDate).toLocaleDateString("vi-VN") : "Không có"})`
    );
  }

  const systemPrompt = `Bạn là một chuyên gia dinh dưỡng và đầu bếp chuyên nghiệp cho ứng dụng "HomeChef".
Nhiệm vụ của bạn là lập kế hoạch ăn uống (meal plan) hàng ngày cho người dùng.

THÔNG TIN ĐẦU VÀO:
1. Số ngày cần lên kế hoạch: ${daysCount} ngày (từ Ngày 1 đến Ngày ${daysCount})
2. Số người ăn: ${peopleCount} người
3. Chế độ ăn uống / Mục tiêu sức khỏe: ${healthGoal}
4. Thực phẩm hiện có trong tủ lạnh (ƯU TIÊN sử dụng các nguyên liệu này, đặc biệt là những thứ sắp hết hạn):
${pantryList.length > 0 ? pantryList.join("\n") : "Không có thực phẩm nào trong tủ lạnh"}
5. Sở thích khẩu vị của người dùng: ${JSON.stringify(user.dietaryPreferences || [])}
6. Dị ứng (TUYỆT ĐỐI không sử dụng nguyên liệu này): ${JSON.stringify(user.allergies || [])}

QUY TẮC LẬP KẾ HOẠCH:
- Mỗi ngày gồm 3 bữa: Sáng (Breakfast), Trưa (Lunch), Tối (Dinner).
- Các món ăn phải ngon, dễ chế biến tại nhà, phù hợp với số lượng người ăn và mục tiêu sức khỏe.
- Ưu tiên sử dụng nguyên liệu sẵn có trong tủ lạnh để tránh lãng phí thực phẩm.
- Chỉ đề xuất các món ăn thực tế bằng Tiếng Việt.

ĐỊNH DẠNG ĐẦU RA BẮT BUỘC:
Trả về kết quả dưới dạng chuỗi JSON nguyên gốc, không kèm ký hiệu markdown \`\`\`json. Cấu trúc JSON bắt buộc như sau:
{
  "meals": [
    {
      "dayNumber": 1,
      "slot": "Sáng",
      "dishName": "Tên món ăn bằng tiếng Việt (Ví dụ: Bánh mì ốp la trứng xúc xích)",
      "calories": 350,
      "protein": 15,
      "cookTime": 15,
      "ingredientsUsed": ["Trứng", "Bánh mì"]
    },
    ...
  ]
}`;

  const userPrompt = `Hãy tạo kế hoạch ăn uống cho ${peopleCount} người trong ${daysCount} ngày dựa trên thông tin trên.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_KEY}`;
  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ parts: [{ text: userPrompt }] }]
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  if (data.error) throw new Error(`Gemini AI Meal Planner error: ${data.error.message}`);

  let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned empty response for meal planner");

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Could not parse JSON from Gemini response");
  const planJson = JSON.parse(match[0]);

  const getIsoDateString = (daysOffset) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const savedMeals = [];
  
  for (const meal of planJson.meals) {
    const dateStr = getIsoDateString(meal.dayNumber - 1);
    
    // Find matching recipe in local database or create placeholder
    let recipe = await Recipe.findOne({ title: { $regex: new RegExp("^" + meal.dishName + "$", "i") } });
    if (!recipe) {
      recipe = await Recipe.findOne({ title: { $regex: new RegExp(meal.dishName, "i") } });
    }
    
    if (!recipe) {
      recipe = await Recipe.create({
        title: meal.dishName,
        calories: meal.calories || 300,
        protein: meal.protein || 15,
        cookTime: meal.cookTime || 20,
        ingredients: meal.ingredientsUsed.map(name => ({ name, quantity: 1, unit: "phần" })),
        instructions: ["Chuẩn bị nguyên liệu.", "Chế biến theo hướng dẫn của HomeChef.", "Thưởng thức món ăn cùng gia đình."],
        isCustom: true,
        creator: userId
      });
    }

    // Upsert meal plan slot
    const updatedSlot = await MealPlan.findOneAndUpdate(
      { user: userId, date: dateStr, slot: meal.slot },
      { user: userId, date: dateStr, slot: meal.slot, recipe: recipe._id },
      { upsert: true, new: true }
    ).populate("recipe", "title image cookTime calories");

    savedMeals.push(updatedSlot);
  }

  return savedMeals;
};

module.exports = {
  getByDateRange,
  assignMeal,
  removeMeal,
  generateAIMealPlan
};
