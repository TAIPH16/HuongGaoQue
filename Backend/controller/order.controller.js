const orderService = require("../service/order.service");

/**
 * GET /api/orders - Lấy danh sách đơn hàng với phân trang và lọc
 */
const getOrders = async (req, res, next) => {
  try {
    const result = await orderService.getOrders(req.query);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/stats - Lấy thống kê đơn hàng
 */
const getOrderStats = async (req, res, next) => {
  try {
    const stats = await orderService.getOrderStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/stats/by-date - Thống kê đơn hàng theo ngày (hành vi mua hàng)
 * Query: startDate, endDate (YYYY-MM-DD)
 */
const getOrderStatsByDate = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await orderService.getOrderStatsByDate(startDate, endDate);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id - Lấy chi tiết đơn hàng
 */
const getOrderDetail = async (req, res, next) => {
  try {
    const order = await orderService.getOrderDetail(req.params.id);
    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    if (error.message === "Không tìm thấy đơn hàng") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * POST /api/orders - Tạo đơn hàng mới
 */
const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.body);
    res.status(201).json({
      success: true,
      message: "Tạo đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    if (
      error.message.includes("Không tồn tại") ||
      error.message.includes("không đủ số lượng")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * PUT /api/orders/:id - Cập nhật đơn hàng
 */
const updateOrder = async (req, res, next) => {
  try {
    const order = await orderService.updateOrder(req.params.id, req.body);
    res.json({
      success: true,
      message: "Cập nhật đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    if (error.message === "Không tìm thấy đơn hàng") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * DELETE /api/orders/:id - Xóa đơn hàng
 */
const deleteOrder = async (req, res, next) => {
  try {
    await orderService.deleteOrder(req.params.id);
    res.json({
      success: true,
      message: "Xóa đơn hàng thành công",
    });
  } catch (error) {
    if (error.message === "Không tìm thấy đơn hàng") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message.includes("Chỉ có thể xóa")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * POST /api/customer/orders - Create new order by customer
 */
const createCustomerOrder = async (req, res, next) => {
  try {
    // Use authenticated user as customer
    const orderData = {
      ...req.body,
      customer: req.user._id.toString(),
    };
    const order = await orderService.createOrder(orderData);
    res.status(201).json({
      success: true,
      message: "Tạo đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    if (
      error.message.includes("Không tồn tại") ||
      error.message.includes("không đủ số lượng")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * GET /api/customer/orders - Get orders for the authenticated customer
 */
const getCustomerOrders = async (req, res, next) => {
  try {
    const query = {
      ...req.query,
      customerId: req.user._id.toString(),
    };
    const result = await orderService.getOrders(query);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/customer/orders/:id - Get detail of a specific order for the authenticated customer
 */
const getCustomerOrderDetail = async (req, res, next) => {
  try {
    const order = await orderService.getOrderDetail(req.params.id);

    // Verify that the order belongs to the authenticated customer
    if (order.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xem đơn hàng này",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    if (error.message === "Không tìm thấy đơn hàng") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * PUT /api/customer/orders/:id - Customer updates order status
 */
const updateCustomerOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const customerId = req.user._id.toString();
    const { status, cancelledReason } = req.body;

    const order = await orderService.getOrderDetail(orderId);

    // Verify ownership
    if (order.customer._id.toString() !== customerId) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền chỉnh sửa đơn hàng này",
      });
    }

    // --- BẮT ĐẦU FIX LỖI UNDEFINED ---
    let isValid = false;

    // Lấy trạng thái hiện tại. Nếu undefined thì mặc định ngầm hiểu là 'pending'
    const rawCurrentStatus =
      order.status || order.orderStatus || order.Status || "pending";

    const currentStatusLower = rawCurrentStatus.toLowerCase();
    const targetStatusLower = status ? status.toLowerCase() : "";

    // 1. Mark as Paid (WaitingPayment -> WaitingConfirm)
    if (
      targetStatusLower === "waitingconfirm" &&
      currentStatusLower === "waitingpayment"
    )
      isValid = true;

    // 2. Cancel Order (Cho phép hủy khi đang pending hoặc waitingpayment)
    if (
      targetStatusLower === "cancelled" &&
      (currentStatusLower === "pending" ||
        currentStatusLower === "waitingpayment")
    )
      isValid = true;

    // 3. Mark as Received/Completed
    if (
      targetStatusLower === "completed" &&
      (currentStatusLower === "shipping" || currentStatusLower === "delivered")
    )
      isValid = true;

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: `Không thể chuyển trạng thái từ ${rawCurrentStatus} sang ${status}`,
      });
    }

    // Giữ nguyên status hoa/thường y như Frontend gửi lên để lưu vào DB
    const updateData = { status };

    // Đảm bảo luôn có lý do hủy để không bị lỗi schema
    if (targetStatusLower === "cancelled") {
      updateData.cancelledReason =
        cancelledReason || "Khách hàng tự hủy trên web";
    }

    const updatedOrder = await orderService.updateOrder(orderId, updateData);
    res.json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  getOrderStats,
  getOrderStatsByDate,
  getOrderDetail,
  createOrder,
  updateOrder,
  deleteOrder,
  createCustomerOrder,
  getCustomerOrders,
  getCustomerOrderDetail,
  updateCustomerOrder,
};
