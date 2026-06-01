const Recipe = require("../models/Recipe");

const getAll = async (query = {}) => {
  const { page = 1, limit = 10, category, search } = query;

  const filter = {};
  if (category) filter.category = category;
  if (search) filter.title = { $regex: search, $options: "i" };

  const recipes = await Recipe.find(filter)
    .populate("author", "name avatar")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Recipe.countDocuments(filter);

  return {
    recipes,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getById = async (id) => {
  const recipe = await Recipe.findById(id).populate("author", "name avatar");
  if (!recipe) {
    const error = new Error("Recipe not found");
    error.statusCode = 404;
    throw error;
  }
  return recipe;
};

const create = async (data) => {
  const recipe = await Recipe.create(data);
  return recipe;
};

const update = async (id, data) => {
  const recipe = await Recipe.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!recipe) {
    const error = new Error("Recipe not found");
    error.statusCode = 404;
    throw error;
  }
  return recipe;
};

const remove = async (id) => {
  const recipe = await Recipe.findByIdAndDelete(id);
  if (!recipe) {
    const error = new Error("Recipe not found");
    error.statusCode = 404;
    throw error;
  }
  return recipe;
};

// --- Enhanced Vietnamese-aware Recommendation logic ---
const Pantry = require("../models/Pantry");

/**
 * Chuẩn hóa tên nguyên liệu tiếng Việt để so sánh tốt hơn
 * - Chuyển lowercase
 * - Loại bỏ các từ phụ (sơ chế, băm, thái...)
 * - Tách tên ghép (ví dụ: "Tỏi, ớt" → ["tỏi", "ớt"])
 */
const normalizeIngredient = (name) => {
const removeWords = [
    "tươi", "khô", "non", "chín", "sạch", "thái", "băm", "cắt", "xay",
    "lát", "miếng", "bó", "gói", "hộp", "chai", "lon", "quả", "củ", "cây",
    "sợi", "viên", "hoặc", "và", "mỗi loại", "đập dập", "rửa sạch",
    "đùi", "ức", "cánh", "chân", "phi lê", "fillet", "xương", "sụn", "thăn"
  ];
  
  let normalized = name.toLowerCase().trim();
  
  // Tách tên ghép bởi dấu phẩy, "/", "hoặc"
  const parts = normalized.split(/[,\/]/).map(p => p.trim()).filter(p => p.length > 0);
  
  return parts.map(part => {
    // Loại bỏ các từ phụ
    removeWords.forEach(w => {
      part = part.replace(new RegExp(`\\b${w}\\b`, 'gi'), '').trim();
    });
    // Loại bỏ khoảng trắng dư thừa
    return part.replace(/\s+/g, ' ').trim();
  }).filter(p => p.length > 1);
};

/**
 * Kiểm tra 2 nguyên liệu có khớp nhau không (fuzzy matching tiếng Việt)
 */
const isIngredientMatch = (pantryName, recipeName) => {
  const pParts = normalizeIngredient(pantryName);
  const rParts = normalizeIngredient(recipeName);
  
  for (const p of pParts) {
    for (const r of rParts) {
      // So khớp chính xác hoặc chứa nhau
      if (p === r) return true;
      if (p.includes(r) || r.includes(p)) return true;
      
      // So khớp từ gốc (ví dụ: "cà chua bi" vs "cà chua")
      const pWords = p.split(' ');
      const rWords = r.split(' ');
      const commonWords = pWords.filter(w => rWords.includes(w));
      if (commonWords.length >= Math.min(pWords.length, rWords.length) && commonWords.length >= 1) {
        // Nếu >= 50% từ trùng nhau → coi là khớp
        const matchRatio = commonWords.length / Math.max(pWords.length, rWords.length);
        if (matchRatio >= 0.5) return true;
      }
    }
  }
  return false;
};

const getRecommendations = async (userId) => {
  // Get all available pantry ingredients for this specific user
  const filter = userId ? { user: userId } : {};
  const pantryItems = await Pantry.find(filter);
  if (pantryItems.length === 0) return [];

  // Get a pool of recipes
  const allRecipes = await Recipe.find().limit(200);

  // Calculate match scores for each recipe
  const scoredRecipes = allRecipes.map(recipe => {
    const matchedIngredients = [];
    const missingIngredients = [];

    recipe.ingredients.forEach(ing => {
      const found = pantryItems.some(pItem => isIngredientMatch(pItem.name, ing.name));
      if (found) {
        matchedIngredients.push(ing.name);
      } else {
        missingIngredients.push(ing.name);
      }
    });

    return {
      ...recipe.toObject(),
      matchedIngredients,
      missingIngredients,
      matchCount: matchedIngredients.length,
      matchPercentage: recipe.ingredients.length > 0 
        ? Math.round((matchedIngredients.length / recipe.ingredients.length) * 100)
        : 0
    };
  });

  // Lọc chỉ giữ lại những món mà tủ lạnh có đủ 100% nguyên liệu (không thiếu nguyên liệu nào)
  // Sau đó sắp xếp ưu tiên những món tận dụng được nhiều nguyên liệu nhất
  return scoredRecipes
    .filter(r => r.matchCount > 0 && r.missingIngredients.length === 0)
    .sort((a, b) => b.matchCount - a.matchCount);
};


/**
 * Automatically deduct matching ingredients from the Pantry
 */
const consumeRecipe = async (recipeId, servings = 1) => {
  const recipe = await getById(recipeId);
  const pantryItems = await Pantry.find();
  
  const results = [];
  
  // Try to find matches and subtract quantity
  for (const ing of recipe.ingredients) {
    const ingName = ing.name.toLowerCase();
    const match = pantryItems.find(pItem => 
      ingName.includes(pItem.name.toLowerCase()) || pItem.name.toLowerCase().includes(ingName)
    );
    
    if (match) {
      // Simple logic: reduction by 1 unit, or remove if zero
      if (match.quantity <= servings) {
        await Pantry.findByIdAndDelete(match._id);
        results.push({ ingredient: ing.name, status: 'Removed completely from pantry' });
      } else {
        match.quantity -= servings;
        await match.save();
        results.push({ ingredient: ing.name, status: `Reduced count to ${match.quantity}` });
      }
    } else {
      results.push({ ingredient: ing.name, status: 'Not found in pantry, skipped deduction' });
    }
  }
  
  return { success: true, report: results };
};

const fetch = require("node-fetch");

const getHybridSuggestions = async (userIngredients, localSuggestions) => {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) throw new Error("GEMINI_API_KEY is missing in environment variables");

  const systemPrompt = `Bạn là kiến trúc sư ẩm thực và là backend AI của ứng dụng "HomeChef". Nhiệm vụ của bạn là giải quyết bài toán gợi ý món ăn khi Database cục bộ không có đủ món ăn khớp hoàn toàn với nguyên liệu của người dùng.

THÔNG TIN ĐẦU VÀO CỦA BẠN:
1. [User_Ingredients]: Danh sách các nguyên liệu người dùng vừa quét được.
2. [Local_DB_Suggestions]: Các món ăn tìm được trong DB hiện tại (đang bị thiếu nhiều nguyên liệu hoặc độ khớp thấp).

QUY TẮC SUY LUẬN & TỐI ƯU HÓA:
- Ưu tiên 1 ("Nấu Ngay"): Tìm các món ăn sử dụng TỐI ĐA các nguyên liệu trong [User_Ingredients]. Chỉ chấp nhận bổ sung các gia vị cơ bản có sẵn ở mọi gian bếp.
- Ưu tiên 2 ("Biến tấu từ DB"): Nhìn vào [Local_DB_Suggestions], dựa trên tư duy đầu bếp chuyên nghiệp để điều chỉnh công thức.
- Ưu tiên 3 ("Mua thêm ít nhất"): Nếu bắt buộc phải mua thêm nguyên liệu bên ngoài, giới hạn tối đa 2 nguyên liệu phụ và phải là thứ dễ mua.
- Giới hạn số lượng: Luôn trả về chính xác từ 3 đến 5 món ăn tối ưu nhất.

ĐỊNH DẠNG ĐẦU RA BẮT BUỘC:
Chỉ trả về duy nhất một chuỗi JSON hợp lệ (không kèm ký hiệu markdown \`\`\`json). Cấu trúc JSON bắt buộc như sau:

{
  "suggestions": [
    {
      "dish_name": "Tên món ăn bằng tiếng Việt (Ví dụ: Trứng cuộn hành hoa)",
      "type": "Nấu Ngay hoặc Biến tấu từ DB hoặc Cần mua thêm",
      "match_percentage": 85,
      "user_ingredients_used": ["Trứng", "Hành lá"],
      "missing_ingredients": [],
      "cooking_time_minutes": 15,
      "brief_steps": [
        "Bước 1: ...",
        "Bước 2: ..."
      ]
    }
  ]
}`;

  const userPrompt = `
    [User_Ingredients]: ${JSON.stringify(userIngredients)}
    [Local_DB_Suggestions]: ${JSON.stringify(localSuggestions.slice(0, 3))}
  `;

  // Using gemini-flash-latest to automatically route to the best available model and avoid rate limits on specific versions
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
  if (data.error) throw new Error(`Gemini Hybrid lỗi: ${data.error.message}`);

  let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned empty content");
  
  // Clean markdown block if present
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const aiResult = JSON.parse(text);

  // Map format to Frontend requirements
  const mappedRecipes = (aiResult.suggestions || []).map(s => {
    // Merge used and missing ingredients for the DB model
    const ingredients = [
      ...(s.user_ingredients_used || []).map(name => ({ name, quantity: "Tùy chỉnh" })),
      ...(s.missing_ingredients || []).map(name => ({ name, quantity: "Cần mua thêm" }))
    ];

    return {
      title: s.dish_name + (s.type === 'Biến tấu từ DB' ? ' (Biến tấu)' : ''),
      cookTime: s.cooking_time_minutes,
      calories: Math.floor(Math.random() * 200) + 200, // Dummy calories
      difficulty: "Vừa",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
      steps: s.brief_steps.map((step, idx) => ({
        order: idx + 1,
        instruction: step
      })),
      ingredients: ingredients,
      // Extra fields from hybrid output
      matchPercentage: s.match_percentage,
      missingIngredients: s.missing_ingredients,
      type: s.type
    };
  });

  return mappedRecipes;
};

const saveNewRecipesToDB = async (recipes, userId) => {
  try {
    for (const r of recipes) {
      if (r.type === "Nấu Ngay" || r.type === "Biến tấu từ DB") {
        await create({
          title: r.title,
          cookTime: r.cookTime,
          calories: r.calories,
          difficulty: r.difficulty,
          image: r.image,
          steps: r.steps,
          ingredients: r.ingredients,
          category: "other",
          author: userId // Save under this user's ID or an admin ID
        });
      }
    }
  } catch (error) {
    console.error("Lỗi khi lưu công thức AI vào DB:", error);
  }
};

module.exports = { getAll, getById, create, update, remove, getRecommendations, consumeRecipe, getHybridSuggestions, saveNewRecipesToDB };
