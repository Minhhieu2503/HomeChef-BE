const Shopping = require("../models/Shopping");

const getAll = async () => {
  return await Shopping.find().sort({ createdAt: -1 });
};

const create = async (data) => {
  return await Shopping.create(data);
};

const update = async (id, data) => {
  return await Shopping.findByIdAndUpdate(id, data, { new: true });
};

const remove = async (id) => {
  return await Shopping.findByIdAndDelete(id);
};

const clearChecked = async () => {
  return await Shopping.deleteMany({ checked: true });
};

module.exports = {
  getAll,
  create,
  update,
  remove,
  clearChecked
};
