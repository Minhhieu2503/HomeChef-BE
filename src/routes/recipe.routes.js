const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipe.controller");

router.get("/", recipeController.getAll);
router.get("/recommended", recipeController.getRecommended);
router.get("/:id", recipeController.getById);
router.post("/", recipeController.create);
router.post("/:id/consume", recipeController.consume);
router.put("/:id", recipeController.update);
router.delete("/:id", recipeController.remove);

module.exports = router;
