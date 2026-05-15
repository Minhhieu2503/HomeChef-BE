const pantryService = require("../services/pantry.service");

const getAll = async (req, res, next) => {
  try {
    const items = await pantryService.getAll(req.userId, req.query);
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const item = await pantryService.create(req.userId, req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const item = await pantryService.update(req.userId, req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await pantryService.remove(req.userId, req.params.id);
    res.json({ success: true, message: "Item removed from pantry" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  create,
  update,
  remove
};
