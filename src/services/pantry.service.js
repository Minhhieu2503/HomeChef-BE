const Pantry = require("../models/Pantry");

const getAll = async (userId, query = {}) => {
  const filter = { user: userId };
  if (query.category && query.category !== "All") {
    filter.category = query.category;
  }
  return await Pantry.find(filter).sort({ createdAt: -1 });
};

const create = async (userId, data) => {
  return await Pantry.create({ ...data, user: userId });
};

const update = async (userId, id, data) => {
  const item = await Pantry.findOneAndUpdate({ _id: id, user: userId }, data, { new: true, runValidators: true });
  if (!item) throw new Error("Item not found or unauthorized");
  return item;
};

const remove = async (userId, id) => {
  const item = await Pantry.findOneAndDelete({ _id: id, user: userId });
  if (!item) throw new Error("Item not found or unauthorized");
  return item;
};

module.exports = {
  getAll,
  create,
  update,
  remove
};
