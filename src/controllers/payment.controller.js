const crypto = require("crypto");
const moment = require("moment");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

const createPaymentUrl = async (req, res, next) => {
  try {
    const { amount, planId } = req.body;
    const userId = req.userId;

    const date = new Date();
    const createDate = moment(date).format("YYYYMMDDHHmmss");
    
    const tmnCode = process.env.VNP_TMN_CODE;
    const secretKey = process.env.VNP_HASH_SECRET;
    let vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURN_URL;

    const orderId = moment(date).format("DDHHmmss");
    
    // Create pending transaction in DB
    await Transaction.create({
      user: userId,
      amount,
      planId,
      orderId,
      status: "pending"
    });

    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = "vn";
    vnp_Params["vnp_CurrCode"] = "VND";
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = `Thanh toan goi ${planId} - HomeChef`;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = amount * 100;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    vnp_Params["vnp_CreateDate"] = createDate;

    vnp_Params = sortObject(vnp_Params);

    const querystring = require("qs");
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

    res.json({ success: true, url: vnpUrl });
  } catch (error) {
    next(error);
  }
};

const vnpayReturn = async (req, res, next) => {
  try {
    let vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);

    const secretKey = process.env.VNP_HASH_SECRET;
    const querystring = require("qs");
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      const orderId = vnp_Params["vnp_TxnRef"];
      const responseCode = vnp_Params["vnp_ResponseCode"];
      const transactionNo = vnp_Params["vnp_TransactionNo"];

      const transaction = await Transaction.findOne({ orderId });
      if (transaction) {
        if (responseCode === "00") {
          // Success
          transaction.status = "success";
          transaction.vnp_TransactionNo = transactionNo;
          transaction.vnp_ResponseCode = responseCode;
          transaction.paymentDate = new Date();
          await transaction.save();

          // Upgrade user to Premium
          await User.findByIdAndUpdate(transaction.user, { isPremium: true });
          
          res.json({ success: true, message: "Thanh toán thành công" });
        } else {
          // Failed
          transaction.status = "failed";
          transaction.vnp_ResponseCode = responseCode;
          await transaction.save();
          res.json({ success: false, message: "Thanh toán thất bại" });
        }
      } else {
        res.status(404).json({ success: false, message: "Transaction not found" });
      }
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    next(error);
  }
};

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

module.exports = { createPaymentUrl, vnpayReturn };
