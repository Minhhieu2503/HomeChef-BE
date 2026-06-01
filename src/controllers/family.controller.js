const familyService = require("../services/family.service");

exports.createFamily = async (req, res, next) => {
  try {
    const { name } = req.body;
    const family = await familyService.createFamily(req.userId, name);
    res.status(201).json({ success: true, message: "Tạo gia đình thành công", data: family });
  } catch (error) {
    next(error);
  }
};

exports.inviteMember = async (req, res, next) => {
  try {
    const { email } = req.body;
    const family = await familyService.inviteMember(req.userId, email);
    res.json({ success: true, message: "Đã thêm thành viên vào gia đình", data: family });
  } catch (error) {
    next(error);
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    const family = await familyService.removeMember(req.userId, memberId);
    res.json({ success: true, message: "Đã xóa thành viên", data: family });
  } catch (error) {
    next(error);
  }
};

exports.getMyFamily = async (req, res, next) => {
  try {
    const family = await familyService.getMyFamily(req.userId);
    res.json({ success: true, data: family });
  } catch (error) {
    next(error);
  }
};
