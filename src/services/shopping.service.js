const Shopping = require("../models/Shopping");

const getAll = async (userId) => {
  return await Shopping.find({ user: userId }).sort({ createdAt: -1 });
};

const create = async (userId, data) => {
  return await Shopping.create({ ...data, user: userId });
};

const update = async (id, userId, data) => {
  return await Shopping.findOneAndUpdate({ _id: id, user: userId }, data, { new: true });
};

const remove = async (id, userId) => {
  return await Shopping.findOneAndDelete({ _id: id, user: userId });
};

const clearChecked = async (userId) => {
  return await Shopping.deleteMany({ user: userId, checked: true });
};

module.exports = {
  getAll,
  create,
  update,
  remove,
  clearChecked
};
