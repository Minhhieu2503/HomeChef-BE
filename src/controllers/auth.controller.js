const authService = require("../services/auth.service");
const { uploadToCloudinary } = require("../utils/cloudinary.utils");

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.userId);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.userId, req.body);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot password - send verification code
 * @route   POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    res.json({ success: true, message: "Mã xác nhận đã được gửi qua email." });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using verification code
 * @route   POST /api/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body);
    res.json({ success: true, message: "Đổi mật khẩu thành công.", data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user avatar image
 * @route   PUT /api/auth/avatar
 */
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error("Please upload an image file.");
      error.statusCode = 400;
      throw error;
    }

    // Upload image to cloudinary
    const result = await uploadToCloudinary(req.file.buffer, "homechef/avatars");
    
    // Save image URL to user profile
    const updated = await authService.updateAvatar(req.userId, result.secure_url);

    res.json({ 
      success: true, 
      message: "Avatar updated successfully.", 
      data: { avatar: updated.avatar } 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Handle Google authentication
 * @route   POST /api/auth/google
 */
const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      const error = new Error("Google ID token required.");
      error.statusCode = 400;
      throw error;
    }

    const result = await authService.googleLogin(idToken);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const toggleSavedRecipe = async (req, res, next) => {
  try {
    const { recipeId } = req.body;
    const result = await authService.toggleSavedRecipe(req.userId, recipeId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getSavedRecipes = async (req, res, next) => {
  try {
    const result = await authService.getSavedRecipes(req.userId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const upgradeToPremium = async (req, res, next) => {
  try {
    const user = await authService.upgradeToPremium(req.userId);
    res.json({ success: true, message: "Chúc mừng! Bạn đã nâng cấp lên tài khoản Premium thành công.", data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  register, 
  login, 
  getMe, 
  updateProfile, 
  forgotPassword, 
  resetPassword, 
  uploadAvatar, 
  googleLogin,
  toggleSavedRecipe,
  getSavedRecipes,
  upgradeToPremium
};
