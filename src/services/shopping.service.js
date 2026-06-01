const Shopping = require("../models/Shopping");
const familyService = require("./family.service");

const getAll = async (userId) => {
  const members = await familyService.getFamilyMembers(userId);
  return await Shopping.find({ user: { $in: members } }).sort({ createdAt: -1 });
};

const create = async (userId, data) => {
  return await Shopping.create({ ...data, user: userId });
};

const update = async (id, userId, data) => {
  const members = await familyService.getFamilyMembers(userId);
  return await Shopping.findOneAndUpdate({ _id: id, user: { $in: members } }, data, { new: true });
};

const remove = async (id, userId) => {
  const members = await familyService.getFamilyMembers(userId);
  return await Shopping.findOneAndDelete({ _id: id, user: { $in: members } });
};

const clearChecked = async (userId) => {
  const members = await familyService.getFamilyMembers(userId);
  return await Shopping.deleteMany({ user: { $in: members }, checked: true });
};

module.exports = {
  getAll,
  create,
  update,
  remove,
  clearChecked
};
