const { PayOS } = require("@payos/node");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

// Initialize PayOS with credentials from environment variables
// Note: We use fallback values to prevent app crash if keys are not filled yet
const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID || "dummy",
  apiKey: process.env.PAYOS_API_KEY || "dummy",
  checksumKey: process.env.PAYOS_CHECKSUM_KEY || "dummy"
});

const createPaymentUrl = async (req, res, next) => {
  try {
    const { amount, planId } = req.body;
    const userId = req.userId;

    // Generate a unique numeric orderCode for PayOS (64-bit integer max 9007199254740991)
    // Date.now() returns e.g. 1716278231000 which is perfect and fits safely
    const orderCode = Date.now();

    // Create pending transaction in DB
    await Transaction.create({
      user: userId,
      amount,
      planId,
      orderId: String(orderCode), // store as string in Mongoose schema
      status: "pending"
    });

    const paymentData = {
      orderCode,
      amount,
      description: `Gói ${planId === "premium" ? "Premium" : "Family"}`.substring(0, 25),
      cancelUrl: process.env.PAYOS_CANCEL_URL || "http://localhost:5173/payment-result",
      returnUrl: process.env.PAYOS_RETURN_URL || "http://localhost:5173/payment-result"
    };

    // If keys are dummy or not set by user, return a simulated payment link instead of throwing an error
    if (!process.env.PAYOS_CLIENT_ID || process.env.PAYOS_CLIENT_ID === "your_payos_client_id" || process.env.PAYOS_CLIENT_ID === "dummy") {
      console.warn("Using simulated PayOS checkout because credentials are not configured.");
      // We will redirect to returnUrl with PAID status for testing
      const fakeUrl = `${paymentData.returnUrl}?code=00&status=PAID&orderCode=${orderCode}`;
      return res.json({ success: true, url: fakeUrl });
    }

    const paymentLinkRes = await payos.paymentRequests.create(paymentData);
    res.json({ success: true, url: paymentLinkRes.checkoutUrl });
  } catch (error) {
    next(error);
  }
};

const payosReturn = async (req, res, next) => {
  try {
    const { orderCode, status } = req.query;

    console.log("--- PayOS Callback Debug ---");
    console.log("orderCode:", orderCode);
    console.log("status:", status);

    if (!orderCode) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin mã đơn hàng (orderCode)" });
    }

    // 1. If we are running in simulated mode (no real credentials configured)
    if (!process.env.PAYOS_CLIENT_ID || process.env.PAYOS_CLIENT_ID === "your_payos_client_id" || process.env.PAYOS_CLIENT_ID === "dummy") {
      console.log("Simulating successful transaction...");
      const updatedTransaction = await Transaction.findOneAndUpdate(
        { orderId: String(orderCode) },
        { 
          status: "success",
          paymentDate: new Date()
        },
        { new: true }
      );

      if (updatedTransaction) {
        await User.findByIdAndUpdate(updatedTransaction.user, { isPremium: true });
        return res.json({ success: true, message: "Thanh toán thành công (Simulated)" });
      } else {
        return res.status(404).json({ success: false, message: "Không tìm thấy giao dịch" });
      }
    }

    // 2. Real verification using PayOS API
    const paymentInfo = await payos.paymentRequests.getPaymentLinkInformation(parseInt(orderCode, 10));
    console.log("Payment Info from PayOS:", paymentInfo);

    if (paymentInfo.status === "PAID") {
      const updatedTransaction = await Transaction.findOneAndUpdate(
        { orderId: String(orderCode) },
        { 
          status: "success",
          paymentDate: new Date()
        },
        { new: true }
      );

      if (updatedTransaction) {
        await User.findByIdAndUpdate(updatedTransaction.user, { isPremium: true });
        res.json({ success: true, message: "Thanh toán thành công" });
      } else {
        res.status(404).json({ success: false, message: "Không tìm thấy giao dịch" });
      }
    } else {
      await Transaction.findOneAndUpdate({ orderId: String(orderCode) }, { status: "failed" });
      res.json({ success: false, message: `Thanh toán thất bại. Trạng thái: ${paymentInfo.status}` });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { createPaymentUrl, payosReturn };
