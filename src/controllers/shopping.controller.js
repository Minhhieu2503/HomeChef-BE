const shoppingService = require("../services/shopping.service");

exports.getAll = async (req, res, next) => {
  try {
    const items = await shoppingService.getAll(req.userId);
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const item = await shoppingService.create(req.userId, req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const item = await shoppingService.update(req.params.id, req.userId, req.body);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found or unauthorized" });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const result = await shoppingService.remove(req.params.id, req.userId);
    if (!result) {
      return res.status(404).json({ success: false, message: "Item not found or unauthorized" });
    }
    res.json({ success: true, message: "Item removed" });
  } catch (error) {
    next(error);
  }
};

exports.clearChecked = async (req, res, next) => {
  try {
    await shoppingService.clearChecked(req.userId);
    res.json({ success: true, message: "Checked items cleared" });
  } catch (error) {
    next(error);
  }
};
