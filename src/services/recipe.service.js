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
    "sợi", "viên", "hoặc", "và", "mỗi loại", "đập dập", "rửa sạch"
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

  // Sort by highest matched percentage, then by match count
  return scoredRecipes
    .filter(r => r.matchCount > 0)
    .sort((a, b) => {
      if (b.matchPercentage !== a.matchPercentage) return b.matchPercentage - a.matchPercentage;
      return b.matchCount - a.matchCount;
    });
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

module.exports = { getAll, getById, create, update, remove, getRecommendations, consumeRecipe };
