const express = require("express");
const router = express.Router();
const pantryController = require("../controllers/pantry.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware);

router.route("/")
  .get(pantryController.getAll)
  .post(pantryController.create);

router.route("/:id")
  .put(pantryController.update)
  .delete(pantryController.remove);

module.exports = router;
