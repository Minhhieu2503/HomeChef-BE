const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/create-payment", authMiddleware, paymentController.createPaymentUrl);
router.get("/payos-return", paymentController.payosReturn);

module.exports = router;
