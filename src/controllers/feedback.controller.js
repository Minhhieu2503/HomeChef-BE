const Feedback = require("../models/Feedback");
const User = require("../models/User");

/**
 * @desc    Submit user feedback and unlock the feedback gate
 * @route   POST /api/feedback
 * @access  Private
 */
const createFeedback = async (req, res, next) => {
  try {
    const { type, ratingUI, ratingSpeed, ratingContent, comment } = req.body;
    const userId = req.userId;

    if (!ratingUI || !ratingSpeed || !ratingContent || !comment) {
      const error = new Error("Vui lòng đánh giá đầy đủ các mục và nhập ý kiến đóng góp.");
      error.statusCode = 400;
      throw error;
    }

    // Calculate average rating (rounded to nearest integer)
    const rating = Math.round((Number(ratingUI) + Number(ratingSpeed) + Number(ratingContent)) / 3);

    // Create feedback
    const feedback = await Feedback.create({
      user: userId,
      type: type || "general",
      rating,
      ratingUI: Number(ratingUI),
      ratingSpeed: Number(ratingSpeed),
      ratingContent: Number(ratingContent),
      comment,
    });

    // Update user hasGivenFeedback status
    const user = await User.findById(userId);
    if (user) {
      user.hasGivenFeedback = true;
      await user.save();
    }

    // Return the updated user so frontend can refresh local storage
    res.status(201).json({
      success: true,
      message: "Cảm ơn bạn đã gửi góp ý!",
      data: {
        feedback,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          hasGivenFeedback: user.hasGivenFeedback,
          completedMealsCount: user.completedMealsCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all feedbacks for Admin
 * @route   GET /api/feedback/admin
 * @access  Private/Admin
 */
const getAllFeedbacks = async (req, res, next) => {
  try {
    const { type, rating, status, sort } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (rating) filter.rating = Number(rating);
    if (status) filter.status = status;

    let query = Feedback.find(filter).populate("user", "name email avatar");

    if (sort === "oldest") {
      query = query.sort({ createdAt: 1 });
    } else {
      query = query.sort({ createdAt: -1 }); // Default: newest first
    }

    const feedbacks = await query;

    res.json({
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update feedback status
 * @route   PUT /api/feedback/admin/:id
 * @access  Private/Admin
 */
const updateFeedbackStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["pending", "reviewed", "resolved"].includes(status)) {
      const error = new Error("Trạng thái không hợp lệ.");
      error.statusCode = 400;
      throw error;
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("user", "name email avatar");

    if (!feedback) {
      const error = new Error("Không tìm thấy góp ý.");
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      message: "Cập nhật trạng thái góp ý thành công.",
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFeedback,
  getAllFeedbacks,
  updateFeedbackStatus,
};
