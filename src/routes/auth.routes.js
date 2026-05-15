const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middlewares/upload");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/google", authController.googleLogin);
router.get("/me", authMiddleware, authController.getMe);
router.put("/profile", authMiddleware, authController.updateProfile);
router.put("/avatar", authMiddleware, upload.single("avatar"), authController.uploadAvatar);

router.post("/saved-recipes", authMiddleware, authController.toggleSavedRecipe);
router.get("/saved-recipes", authMiddleware, authController.getSavedRecipes);
router.post("/upgrade", authMiddleware, authController.upgradeToPremium);

module.exports = router;
