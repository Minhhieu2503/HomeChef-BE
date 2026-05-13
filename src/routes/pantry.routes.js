const express = require("express");
const router = express.Router();
const pantryController = require("../controllers/pantry.controller");

router.route("/")
  .get(pantryController.getAll)
  .post(pantryController.create);

router.route("/:id")
  .put(pantryController.update)
  .delete(pantryController.remove);

module.exports = router;
