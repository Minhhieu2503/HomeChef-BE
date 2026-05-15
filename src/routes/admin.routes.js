const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

// All admin routes require authentication AND admin role
router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/stats", adminController.getStats);

// User management
router.get("/users", adminController.getAllUsers);
router.put("/users/:id/role", adminController.updateUserRole);
router.put("/users/:id/status", adminController.updateUserStatus);
router.delete("/users/:id", adminController.deleteUser);

// Recipe management
router.get("/recipes", adminController.getAllRecipes);
router.post("/recipes", adminController.createRecipe);
router.put("/recipes/:id", adminController.updateRecipe);
router.put("/recipes/:id/status", adminController.updateRecipeStatus);
router.delete("/recipes/:id", adminController.deleteRecipe);

module.exports = router;
