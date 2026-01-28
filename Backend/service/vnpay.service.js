const crypto = require('crypto');
const querystring = require('qs');
const moment = require('moment');

const VNPAY_TMN_CODE = process.env.VNPAY_TMN_CODE || 'YOUR_TMN_CODE';
const VNPAY_HASH_SECRET = process.env.VNPAY_HASH_SECRET || 'YOUR_HASH_SECRET';
const VNPAY_URL = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const BACKEND_URL = process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:3000';
const VNPAY_RETURN_URL = process.env.VNPAY_RETURN_URL || `${BACKEND_URL}/api/vnpay/return`;

// Cảnh báo nếu return URL là localhost (VNPAY không thể truy cập được)
// Tạm thời tắt cảnh báo
// if (VNPAY_RETURN_URL.includes('localhost') || VNPAY_RETURN_URL.includes('127.0.0.1')) {
//   console.warn('⚠️  CẢNH BÁO: VNPAY Return URL đang sử dụng localhost!');
//   console.warn('   VNPAY không thể truy cập localhost từ server của họ.');
//   console.warn('   Vui lòng sử dụng ngrok hoặc deploy backend lên server thật.');
//   console.warn('   Xem hướng dẫn tại: VNPAY_SETUP.md');
//   console.warn(`   Return URL hiện tại: ${VNPAY_RETURN_URL}`);
// }

/**
 * Tạo URL thanh toán VNPay
 */
const createPaymentUrl = (orderId, amount, orderInfo, orderType = 'other', locale = 'vn') => {
  const date = new Date();
  const createDate = moment(date).format('YYYYMMDDHHmmss');
  const expireDate = moment(date).add(15, 'minutes').format('YYYYMMDDHHmmss');
  
  const ipAddr = '127.0.0.1'; // Có thể lấy từ request sau
  
  const vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = VNPAY_TMN_CODE;
  vnp_Params['vnp_Locale'] = locale;
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = orderInfo;
  vnp_Params['vnp_OrderType'] = orderType;
  vnp_Params['vnp_Amount'] = amount * 100; // VNPay yêu cầu số tiền nhân 100
  vnp_Params['vnp_ReturnUrl'] = VNPAY_RETURN_URL;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;
  vnp_Params['vnp_ExpireDate'] = expireDate;
  
  // Sắp xếp các tham số theo thứ tự alphabet
  vnp_Params['vnp_SecureHash'] = createSecureHash(vnp_Params);
  
  // Tạo URL thanh toán
  const paymentUrl = VNPAY_URL + '?' + querystring.stringify(vnp_Params, { encode: false });
  
  return paymentUrl;
};

/**
 * Tạo chữ ký bảo mật
 */
const createSecureHash = (params) => {
  // Loại bỏ các tham số không cần thiết
  const secureHash = ['vnp_SecureHash', 'vnp_SecureHashType'];
  const sortedParams = {};
  
  Object.keys(params)
    .sort()
    .forEach((key) => {
      if (secureHash.indexOf(key) === -1 && params[key] !== null && params[key] !== '') {
        sortedParams[key] = params[key];
      }
    });
  
  // Tạo query string
  const signData = querystring.stringify(sortedParams, { encode: false });
  
  // Tạo hash
  const hmac = crypto.createHmac('sha512', VNPAY_HASH_SECRET);
  const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
  
  return signed;
};

/**
 * Xác thực chữ ký từ VNPay callback
 */
const verifySecureHash = (params) => {
  const secureHash = params['vnp_SecureHash'];
  delete params['vnp_SecureHash'];
  delete params['vnp_SecureHashType'];
  
  const signData = querystring.stringify(params, { encode: false });
  const hmac = crypto.createHmac('sha512', VNPAY_HASH_SECRET);
  const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
  
  return secureHash === signed;
};

/**
 * Xử lý kết quả thanh toán từ VNPay
 */
const processPaymentResult = (params) => {
  const isValid = verifySecureHash(params);
  
  if (!isValid) {
    return {
      success: false,
      message: 'Chữ ký không hợp lệ',
    };
  }
  
  const responseCode = params['vnp_ResponseCode'];
  const transactionStatus = params['vnp_TransactionStatus'];
  const orderId = params['vnp_TxnRef'];
  const amount = params['vnp_Amount'] / 100; // Chia 100 để lấy số tiền thực
  const transactionNo = params['vnp_TransactionNo'];
  const bankCode = params['vnp_BankCode'];
  
  // ResponseCode = '00' nghĩa là thành công
  if (responseCode === '00' && transactionStatus === '00') {
    return {
      success: true,
      message: 'Thanh toán thành công',
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
    '00': 'Giao dịch thành công',
    '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
    '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking',
    '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
    '11': 'Đã hết hạn chờ thanh toán. Xin vui lòng thực hiện lại giao dịch.',
    '12': 'Thẻ/Tài khoản bị khóa.',
    '13': 'Nhập sai mật khẩu xác thực giao dịch (OTP). Xin vui lòng thực hiện lại giao dịch.',
    '32': 'Số tiền giao dịch không hợp lệ. Số tiền hợp lệ từ 5,000 đến dưới 1 tỷ đồng',
    '51': 'Tài khoản không đủ số dư để thực hiện giao dịch.',
    '72': 'Không tìm thấy website. Vui lòng kiểm tra lại cấu hình return URL. Return URL không tồn tại trên hệ thống VNPAY.',
    '75': 'Ngân hàng thanh toán đang bảo trì.',
    '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định. Xin vui lòng thực hiện lại giao dịch',
    '99': 'Lỗi không xác định.',
  };
  
  return responseMessages[responseCode] || 'Lỗi không xác định';
};

module.exports = {
  createPaymentUrl,
  verifySecureHash,
  processPaymentResult,
};