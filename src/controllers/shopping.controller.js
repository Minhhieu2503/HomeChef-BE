const shoppingService = require("../services/shopping.service");

exports.getAll = async (req, res, next) => {
  try {
    const items = await shoppingService.getAll();
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const item = await shoppingService.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const item = await shoppingService.update(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await shoppingService.remove(req.params.id);
    res.json({ success: true, message: "Item removed" });
  } catch (error) {
    next(error);
  }
};

exports.clearChecked = async (req, res, next) => {
  try {
    await shoppingService.clearChecked();
    res.json({ success: true, message: "Checked items cleared" });
  } catch (error) {
    next(error);
  }
};
