const Family = require("../models/Family");
const User = require("../models/User");

const getFamilyMembers = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.familyId) {
    return [userId]; // Not in a family, return just themselves
  }
  
  const family = await Family.findById(user.familyId);
  if (!family) {
    return [userId];
  }
  
  return family.members;
};

const createFamily = async (userId, name) => {
  const user = await User.findById(userId);
  if (user.plan !== "family") {
    throw new Error("Tính năng này chỉ dành cho tài khoản Family");
  }
  if (user.familyId) {
    throw new Error("Bạn đã ở trong một gia đình");
  }
  
  const family = await Family.create({
    name: name || "Gia đình của tôi",
    admin: userId,
    members: [userId]
  });
  
  user.familyId = family._id;
  await user.save();
  
  return family;
};

const inviteMember = async (userId, email) => {
  const family = await Family.findOne({ admin: userId });
  if (!family) {
    throw new Error("Bạn không phải là quản trị viên của gia đình nào");
  }
  
  if (family.members.length >= family.maxMembers) {
    throw new Error(`Gia đình đã đạt giới hạn tối đa ${family.maxMembers} thành viên`);
  }
  
  const targetUser = await User.findOne({ email });
  if (!targetUser) {
    throw new Error("Không tìm thấy tài khoản với email này");
  }
  
  if (targetUser.familyId) {
    throw new Error("Người này đã ở trong một gia đình khác");
  }
  
  // Add member
  family.members.push(targetUser._id);
  await family.save();
  
  targetUser.familyId = family._id;
  await targetUser.save();
  
  return family;
};

const removeMember = async (adminId, targetUserId) => {
  const family = await Family.findOne({ admin: adminId });
  if (!family) throw new Error("Bạn không phải là quản trị viên");
  
  if (adminId === targetUserId) {
    throw new Error("Quản trị viên không thể tự xóa mình. Hãy giải tán gia đình.");
  }
  
  family.members = family.members.filter(m => m.toString() !== targetUserId.toString());
  await family.save();
  
  await User.findByIdAndUpdate(targetUserId, { familyId: null });
  
  return family;
};

const getMyFamily = async (userId) => {
  const user = await User.findById(userId).populate({
    path: 'familyId',
    populate: {
      path: 'members',
      select: 'name email avatar'
    }
  });
  
  return user.familyId;
};

module.exports = {
  getFamilyMembers,
  createFamily,
  inviteMember,
  removeMember,
  getMyFamily
};
