const User = require("../models/User");
const Pantry = require("../models/Pantry");
const bcrypt = require("bcryptjs");
const jwtUtils = require("../utils/jwt.utils");
const sendEmail = require("../utils/email.utils");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const register = async (userData) => {
  const { name, email, password, ...rest } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("Email already exists");
    error.statusCode = 400;
    throw error;
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({ 
    ...rest, 
    name, 
    email, 
    password: hashedPassword 
  });

  // Generate JWT token
  const token = jwtUtils.generateToken({ id: user._id });

  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    token,
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  // Compare hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  // Generate JWT token
  const token = jwtUtils.generateToken({ id: user._id });

  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    token,
  };
};

const getMe = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const updateProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (updateData.name) user.name = updateData.name;
  if (updateData.email) {
    const existing = await User.findOne({ email: updateData.email, _id: { $ne: userId } });
    if (existing) {
      const error = new Error("Email is already in use by another account");
      error.statusCode = 400;
      throw error;
    }
    user.email = updateData.email;
  }
  if (updateData.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(updateData.password, salt);
  }
  
  // New fields
  if (updateData.calorieGoal !== undefined) user.calorieGoal = updateData.calorieGoal;
  if (updateData.dietaryPreferences) user.dietaryPreferences = updateData.dietaryPreferences;
  if (updateData.allergies) user.allergies = updateData.allergies;
  if (updateData.healthGoal) user.healthGoal = updateData.healthGoal;

  await user.save();

  return user; // Return full user object without password
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("There is no user with that email address.");
    error.statusCode = 404;
    throw error;
  }

  // Generate random 6-digit reset token
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Hash and set to resetPasswordToken field
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire time (10 minutes)
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  // Send email
  const message = `Mã xác nhận khôi phục mật khẩu của bạn là: ${resetToken}\nMã này có hiệu lực trong 10 phút.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Yêu cầu khôi phục mật khẩu - HomeChef",
      message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <h2 style="color: #4CAF50; text-align: center;">Khôi phục mật khẩu HomeChef</h2>
          <p>Xin chào,</p>
          <p>Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
          <div style="background: #f9f9f9; padding: 15px; text-align: center; border-radius: 4px; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #333;">${resetToken}</span>
          </div>
          <p style="color: #666; font-size: 14px;">Mã này có hiệu lực trong 10 phút. Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; text-align: center; color: #888;">Đây là email tự động, vui lòng không trả lời.</p>
        </div>
      `
    });
    return true;
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    const error = new Error("Email could not be sent. Please try again.");
    error.statusCode = 500;
    throw error;
  }
};

const resetPassword = async ({ email, code, newPassword }) => {
  // Get user by comparing hashed resetPasswordToken
  const hashedToken = crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");

  const user = await User.findOne({
    email,
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    const error = new Error("Mã xác nhận không hợp lệ hoặc đã hết hạn.");
    error.statusCode = 400;
    throw error;
  }

  // Set new password and hash it
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  
  // Clear fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  
  await user.save();

  return { success: true };
};

const updateAvatar = async (userId, avatarUrl) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  user.avatar = avatarUrl;
  await user.save();

  return { id: user._id, avatar: user.avatar };
};

const googleLogin = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with random safe password since they log in with Google
      const randomPassword = crypto.randomBytes(16).toString("hex");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await User.create({
        name: name || `User-${sub.substring(0, 5)}`,
        email,
        password: hashedPassword,
        avatar: picture || "",
      });
    }

    // Generate token
    const token = jwtUtils.generateToken({ id: user._id });

    return {
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      token,
    };
  } catch (err) {
    console.error("Google verification error:", err.message);
    const error = new Error("Invalid Google token.");
    error.statusCode = 401;
    throw error;
  }
};

const toggleSavedRecipe = async (userId, recipeId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const index = user.savedRecipes.indexOf(recipeId);
  if (index > -1) {
    user.savedRecipes.splice(index, 1);
  } else {
    user.savedRecipes.push(recipeId);
  }

  await user.save();
  return user.savedRecipes;
};

const getSavedRecipes = async (userId) => {
  const user = await User.findById(userId).populate("savedRecipes");
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user.savedRecipes;
};

const upgradeToPremium = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  user.isPremium = true;
  await user.save();
  return user;
};

module.exports = { register, login, getMe, updateProfile, forgotPassword, resetPassword, updateAvatar, googleLogin, toggleSavedRecipe, getSavedRecipes, upgradeToPremium };
