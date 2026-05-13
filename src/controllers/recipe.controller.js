const recipeService = require("../services/recipe.service");

/**
 * @desc    Get all recipes
 * @route   GET /api/recipes
 */
const getAll = async (req, res, next) => {
  try {
    const recipes = await recipeService.getAll(req.query);
    res.json({ success: true, data: recipes });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recipe by ID
 * @route   GET /api/recipes/:id
 */
const getById = async (req, res, next) => {
  try {
    const recipe = await recipeService.getById(req.params.id);
    res.json({ success: true, data: recipe });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a recipe
 * @route   POST /api/recipes
 */
const create = async (req, res, next) => {
  try {
    const recipe = await recipeService.create(req.body);
    res.status(201).json({ success: true, data: recipe });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a recipe
 * @route   PUT /api/recipes/:id
 */
const update = async (req, res, next) => {
  try {
    const recipe = await recipeService.update(req.params.id, req.body);
    res.json({ success: true, data: recipe });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a recipe
 * @route   DELETE /api/recipes/:id
 */
const remove = async (req, res, next) => {
  try {
    await recipeService.remove(req.params.id);
    res.json({ success: true, message: "Recipe deleted" });
  } catch (error) {
    next(error);
  }
};

const getRecommended = async (req, res, next) => {
  try {
    const recommendations = await recipeService.getRecommendations();
    res.json({ success: true, data: recommendations });
  } catch (error) {
    next(error);
  }
};

const consume = async (req, res, next) => {
  try {
    const { servings } = req.body;
    const response = await recipeService.consumeRecipe(req.params.id, servings || 1);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove, getRecommended, consume };
