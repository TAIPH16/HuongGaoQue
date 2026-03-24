const { VNPay } = require("vnpay");

const vnpay = new VNPay({
  secureSecret:
    process.env.VNPAY_HASH_SECRET || "NRIF9ZEBUQCMN16VHVY2GVA9WVP5UJTU",
  tmnCode: process.env.VNPAY_TMN_CODE || "EGZ3FSXA",
  testMode: true,
});

/**
 * Tạo URL thanh toán VNPay
 */
const createPaymentUrl = (
  orderId,
  amount,
  orderInfo,
  orderType = "other",
  locale = "vn",
) => {
  const paymentUrl = vnpay.buildPaymentUrl({
    vnp_TxnRef: orderId,
    vnp_Amount: amount * 100, // VNPay yêu cầu số tiền nhân 100
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: orderType,
    vnp_Locale: locale,
    vnp_ReturnUrl:
      process.env.VNPAY_RETURN_URL ||
      `${process.env.BACKEND_URL || process.env.API_URL || "http://localhost:3000"}/api/vnpay/return`,
    vnp_IpAddr: "127.0.0.1", // Có thể lấy từ request sau
  });

  console.log(paymentUrl);

  return paymentUrl;
};

/**
 * Xác thực chữ ký từ VNPay callback
 */
const verifySecureHash = (params) => {
  return vnpay.verifyReturnUrl(params);
};

/**
 * Xử lý kết quả thanh toán từ VNPay
 */
const processPaymentResult = (params) => {
  const isValid = verifySecureHash(params);

  if (!isValid) {
    return {
      success: false,
      message: "Chữ ký không hợp lệ",
    };
  }

  const responseCode = params["vnp_ResponseCode"];
  const transactionStatus = params["vnp_TransactionStatus"];
  const orderId = params["vnp_TxnRef"];
  const amount = params["vnp_Amount"] / 100; // Chia 100 để lấy số tiền thực
  const transactionNo = params["vnp_TransactionNo"];
  const bankCode = params["vnp_BankCode"];

  // ResponseCode = '00' nghĩa là thành công
  if (responseCode === "00" && transactionStatus === "00") {
    return {
      success: true,
      message: "Thanh toán thành công",
      orderId,
      amount,
      transactionNo,
      bankCode,
      params,
    };
  } else {
    return {
      success: false,
      message: getResponseMessage(responseCode),
      orderId,
      amount,
      transactionNo,
      bankCode,
      params,
    };
  }
};

/**
 * Lấy thông báo lỗi từ response code
 */
const getResponseMessage = (responseCode) => {
  const responseMessages = {
    "00": "Giao dịch thành công",
    "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
    "09": "Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking",
    10: "Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
    11: "Đã hết hạn chờ thanh toán. Xin vui lòng thực hiện lại giao dịch.",
    12: "Thẻ/Tài khoản bị khóa.",
    13: "Nhập sai mật khẩu xác thực giao dịch (OTP). Xin vui lòng thực hiện lại giao dịch.",
    32: "Số tiền giao dịch không hợp lệ. Số tiền hợp lệ từ 5,000 đến dưới 1 tỷ đồng",
    51: "Tài khoản không đủ số dư để thực hiện giao dịch.",
    72: "Không tìm thấy website. Vui lòng kiểm tra lại cấu hình return URL. Return URL phải có thể truy cập được từ internet (không thể dùng localhost).",
    65: "Tài khoản đã vượt quá hạn mức giao dịch trong ngày.",
    75: "Ngân hàng thanh toán đang bảo trì.",
    79: "Nhập sai mật khẩu thanh toán quá số lần quy định. Xin vui lòng thực hiện lại giao dịch.",
    99: "Lỗi không xác định",
  };

  return (
    responseMessages[responseCode] || `Lỗi không xác định (Mã: ${responseCode})`
  );
};

module.exports = {
  createPaymentUrl,
  verifySecureHash,
  processPaymentResult,
  getResponseMessage,
};
