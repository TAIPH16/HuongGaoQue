const express = require('express');
const router = express.Router();
const vnpayController = require('../controller/vnpay.controller');
const protectRoute = require('../middleware/auth.middleware');

// POST /api/vnpay/create-payment-url - Tạo URL thanh toán VNPay (cần đăng nhập)
router.post('/create-payment-url', protectRoute(['user']), vnpayController.createPaymentUrl);

// GET /api/vnpay/return - Callback từ VNPay (không cần đăng nhập vì VNPay sẽ gọi trực tiếp)
router.get('/return', vnpayController.handlePaymentReturn);

// GET /api/vnpay/check-status/:orderId - Kiểm tra trạng thái thanh toán (cần đăng nhập)
router.get('/check-status/:orderId', protectRoute(['user']), vnpayController.checkPaymentStatus);

module.exports = router;

