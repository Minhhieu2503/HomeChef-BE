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

// --- Added Recommendation logic ---
const Pantry = require("../models/Pantry");

const getRecommendations = async () => {
  // Get all available pantry ingredients
  const pantryItems = await Pantry.find();
  const availableNames = pantryItems.map(i => i.name.toLowerCase());

  // Get a pool of recipes
  const allRecipes = await Recipe.find().limit(100);

  // Calculate match scores for each recipe
  const scoredRecipes = allRecipes.map(recipe => {
    let matchCount = 0;
    recipe.ingredients.forEach(ing => {
      const ingName = ing.name.toLowerCase();
      // Check if any pantry item exists within the recipe ingredient name
      const found = availableNames.some(pantryName => ingName.includes(pantryName) || pantryName.includes(ingName));
      if (found) matchCount++;
    });

    return {
      ...recipe.toObject(),
      matchScore: matchCount,
      matchPercentage: recipe.ingredients.length > 0 
        ? Math.round((matchCount / recipe.ingredients.length) * 100)
        : 0
    };
  });

  // Sort by highest matched count/percentage descending
  return scoredRecipes.sort((a, b) => b.matchPercentage - a.matchPercentage);
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
