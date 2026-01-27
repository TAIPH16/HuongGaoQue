const orderService = require('../service/order.service');

/**
 * GET /api/orders - Lấy danh sách đơn hàng với phân trang và lọc
 */
const getOrders = async (req, res, next) => {
    try {
        const result = await orderService.getOrders(req.query);
        res.json({
            success: true,
            data: result.data,
            pagination: result.pagination
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
            data: stats
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
            data: order
        });
    } catch (error) {
        if (error.message === 'Không tìm thấy đơn hàng') {
            return res.status(404).json({
                success: false,
                message: error.message
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
            message: 'Tạo đơn hàng thành công',
            data: order
        });
    } catch (error) {
        if (error.message.includes('Không tồn tại') || error.message.includes('không đủ số lượng')) {
            return res.status(400).json({
                success: false,
                message: error.message
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
            message: 'Cập nhật đơn hàng thành công',
            data: order
        });
    } catch (error) {
        if (error.message === 'Không tìm thấy đơn hàng') {
            return res.status(404).json({
                success: false,
                message: error.message
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
            message: 'Xóa đơn hàng thành công'
        });
    } catch (error) {
        if (error.message === 'Không tìm thấy đơn hàng') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        if (error.message.includes('Chỉ có thể xóa')) {
            return res.status(400).json({
                success: false,
                message: error.message
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
            customer: req.user._id.toString()
        };
        const order = await orderService.createOrder(orderData);
        res.status(201).json({
            success: true,
            message: 'Tạo đơn hàng thành công',
            data: order
        });
    } catch (error) {
        if (error.message.includes('Không tồn tại') || error.message.includes('không đủ số lượng')) {
            return res.status(400).json({
                success: false,
                message: error.message
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
            customerId: req.user._id.toString()
        };
        const result = await orderService.getOrders(query);
        res.json({
            success: true,
            data: result.data,
            pagination: result.pagination
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
                message: 'Bạn không có quyền xem đơn hàng này'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        if (error.message === 'Không tìm thấy đơn hàng') {
            return res.status(404).json({
                success: false,
                message: error.message
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
                message: 'Bạn không có quyền chỉnh sửa đơn hàng này'
            });
        }

        // Validate transitions for customer
        let isValid = false;
        const currentStatus = order.status;

        // 1. Mark as Paid (WaitingPayment -> WaitingConfirm)
        if (status === 'WaitingConfirm' && currentStatus === 'WaitingPayment') isValid = true;

        // 2. Cancel Order
        if (status === 'Cancelled' && (currentStatus === 'Pending' || currentStatus === 'WaitingPayment')) isValid = true;

        // 3. Mark as Received/Completed
        if (status === 'Completed' && (currentStatus === 'Shipping' || currentStatus === 'Delivered')) isValid = true;

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: `Không thể chuyển trạng thái từ ${currentStatus} sang ${status}`
            });
        }

        const updateData = { status };
        if (status === 'Cancelled') updateData.cancelledReason = cancelledReason;

        const updatedOrder = await orderService.updateOrder(orderId, updateData);
        res.json({
            success: true,
            message: 'Cập nhật trạng thái đơn hàng thành công',
            data: updatedOrder
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getOrders,
    getOrderStats,
    getOrderDetail,
    createOrder,
    updateOrder,
    deleteOrder,
    createCustomerOrder,
    getCustomerOrders,
    getCustomerOrderDetail,
    updateCustomerOrder
};

