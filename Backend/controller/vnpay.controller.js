const vnpayService = require('../service/vnpay.service');
const Order = require('../model/order');

/**
 * Tạo URL thanh toán VNPay
 */
const createPaymentUrl = async (req, res, next) => {
  try {
    const { orderId, amount, orderInfo } = req.body;
    
    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin orderId hoặc amount',
      });
    }
    
    // Validate số tiền: VNPAY yêu cầu từ 5,000 đến dưới 1 tỷ VND
    const minAmount = 5000; // 5,000 VND
    const maxAmount = 999999999; // Dưới 1 tỷ VND
    
    if (amount < minAmount || amount >= maxAmount) {
      return res.status(400).json({
        success: false,
        message: `Số tiền không hợp lệ. Số tiền hợp lệ từ ${minAmount.toLocaleString('vi-VN')} đến dưới ${maxAmount.toLocaleString('vi-VN')} VND`,
      });
    }
    
    // Kiểm tra đơn hàng có tồn tại không
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng',
      });
    }
    
    // Kiểm tra đơn hàng có thuộc về user hiện tại không
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thanh toán đơn hàng này',
      });
    }
    
    // Kiểm tra đơn hàng đã được thanh toán chưa
    if (order.paymentStatus === 'paid' || order.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng đã được thanh toán',
      });
    }
    
    const paymentUrl = vnpayService.createPaymentUrl(
      orderId,
      amount,
      orderInfo || `Thanh toan don hang ${order.orderNumber}`
    );
    
    res.json({
      success: true,
      paymentUrl,
      orderId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Xử lý callback từ VNPay
 */
const handlePaymentReturn = async (req, res, next) => {
  try {
    const result = vnpayService.processPaymentResult(req.query);
    
    if (result.success) {
      // Cập nhật trạng thái đơn hàng
      const order = await Order.findById(result.orderId);
      if (order) {
        order.paymentStatus = 'paid';
        order.payment_method = 'vnpay';
        order.status = 'processing'; // Chuyển sang đang xử lý
        await order.save();
      }
      
      // Redirect đến trang success
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/thanh-toan-vnpay/success?orderId=${result.orderId}&transactionNo=${result.transactionNo}`);
    } else {
      // Redirect đến trang thất bại
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/thanh-toan-vnpay/fail?orderId=${result.orderId}&message=${encodeURIComponent(result.message)}`);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Kiểm tra trạng thái thanh toán
 */
const checkPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng',
      });
    }
    
    // Kiểm tra quyền truy cập
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem đơn hàng này',
      });
    }
    
    res.json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentUrl,
  handlePaymentReturn,
  checkPaymentStatus,
};

