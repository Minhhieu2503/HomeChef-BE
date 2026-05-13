const Pantry = require("../models/Pantry");

const getAll = async (query = {}) => {
  // Optional: add filters based on query
  const filter = {};
  if (query.category && query.category !== "All") {
    filter.category = query.category;
  }
  return await Pantry.find(filter).sort({ createdAt: -1 });
};

const create = async (data) => {
  return await Pantry.create(data);
};

const update = async (id, data) => {
  const item = await Pantry.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!item) throw new Error("Item not found");
  return item;
};

const remove = async (id) => {
  const item = await Pantry.findByIdAndDelete(id);
  if (!item) throw new Error("Item not found");
  return item;
};

module.exports = {
  getAll,
  create,
  update,
  remove
};
