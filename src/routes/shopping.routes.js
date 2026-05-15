const express = require("express");
const router = express.Router();
const shoppingController = require("../controllers/shopping.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware);

router.route("/")
  .get(shoppingController.getAll)
  .post(shoppingController.create);

router.delete("/checked", shoppingController.clearChecked);

router.route("/:id")
  .put(shoppingController.update)
  .delete(shoppingController.remove);

module.exports = router;
