const User = require("../models/User");
const Recipe = require("../models/Recipe");
const Transaction = require("../models/Transaction");

/**
 * @desc    Get dashboard stats
 * @route   GET /api/admin/stats
 */
const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRecipes = await Recipe.countDocuments();
    const activeRecipes = await Recipe.countDocuments({ status: "approved" });
    const pendingRecipes = await Recipe.countDocuments({ status: "pending" });
    
    // Revenue calculation from successful transactions
    const successfulTransactions = await Transaction.find({ status: "success" });
    const totalRevenue = successfulTransactions.reduce((acc, curr) => {
      const amount = Number(curr.amount) || 0;
      return acc + amount;
    }, 0);

    // Growth calculation (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const prevUsers = totalUsers - newUsers;
    const growthRate = prevUsers > 0 ? Math.round((newUsers / prevUsers) * 100) : 100;

    // Top 5 recipes by views for the ranking list
    const topRecipes = await Recipe.find()
      .sort("-views")
      .limit(5);

    // Recent 5 activities (newly created recipes)
    const recentActivities = await Recipe.find()
      .populate("author", "name")
      .sort("-createdAt")
      .limit(5);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalRecipes,
        activeRecipes,
        pendingRecipes,
        newUsersGrowth: growthRate,
        systemUptime: "99.99%",
        revenue: totalRevenue,
        recentActivity: recentActivities.map(r => ({
          id: r._id,
          title: r.title,
          author: r.author?.name || "System",
          time: "Gần đây"
        })),
        topRecipes: topRecipes.map(r => ({
          id: r._id,
          name: r.title,
          views: r.views || 0,
          growth: r.views > 10 ? "+12%" : "+0%" 
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort("-createdAt");
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user status (lock/unlock)
 * @route   PUT /api/admin/users/:id/status
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["active", "locked"].includes(status)) {
      return res.status(400).json({ success: false, message: "Trạng thái không hợp lệ" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password");

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 */
const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Đã xóa người dùng" });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all recipes
 * @route   GET /api/admin/recipes
 */
const getAllRecipes = async (req, res, next) => {
  try {
    const recipes = await Recipe.find()
      .populate("author", "name email")
      .sort("-createdAt");
    res.json({ success: true, data: recipes });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update recipe status (approve/reject)
 * @route   PUT /api/admin/recipes/:id/status
 */
const updateRecipeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, data: recipe });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete any recipe
 */
const deleteRecipe = async (req, res, next) => {
  try {
    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Đã xóa món ăn" });
  } catch (error) {
    next(error);
  }
};

// Update existing recipe content
const updateRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedRecipe = await Recipe.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedRecipe) {
      return res.status(404).json({ success: false, message: "Không tìm thấy món ăn" });
    }
    res.json({ success: true, data: updatedRecipe });
  } catch (error) {
    next(error);
  }
};

// Create new recipe
const createRecipe = async (req, res, next) => {
  try {
    const newRecipe = new Recipe({
      ...req.body,
      author: req.userId,
      status: 'approved'
    });
    await newRecipe.save();
    res.status(201).json({ success: true, data: newRecipe });
  } catch (error) {
    next(error);
  }
};

// Get all transactions
const getAllTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find()
      .populate("user", "name email")
      .sort("-createdAt");
    res.json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getAllRecipes,
  updateRecipeStatus,
  deleteRecipe,
  updateRecipe,
  createRecipe,
  getAllTransactions
};
