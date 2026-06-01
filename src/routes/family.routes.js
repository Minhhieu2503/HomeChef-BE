const express = require("express");
const router = express.Router();
const familyController = require("../controllers/family.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware);

router.get("/me", familyController.getMyFamily);
router.post("/create", familyController.createFamily);
router.post("/invite", familyController.inviteMember);
router.delete("/member/:memberId", familyController.removeMember);

module.exports = router;
