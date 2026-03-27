const Order = require('../model/order');
const Product = require('../model/product');
const User = require('../model/user');
const Notification = require('../model/notification');

// Use User model as Customer (customers are Users with role 'user')
const Customer = User;


/**
 * Lấy danh sách đơn hàng với phân trang và lọc
 */
const getOrders = async (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = query.status;
    const customerId = query.customerId;
    const search = query.search || '';

    // Tạo query
    let filter = {};

    if (status) {
        filter.status = status;
    }
    if (customerId) {
        filter.customer = customerId;
    }
    if (search) {
        filter.orderNumber = { $regex: search, $options: 'i' };
    }

    const orders = await Order.find(filter)
        .populate('customer', 'fullName email phoneNumber')
        .populate('items.product', 'name images productId')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Order.countDocuments(filter);

    return {
        data: orders,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalOrders: total,
            limit: limit
        }
    };
};

/**
 * Lấy thống kê đơn hàng
 */
const getOrderStats = async () => {
    const stats = await Order.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalRevenue: { $sum: '$total' }
            }
        }
    ]);

    const totalStats = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$total' },
                totalItems: { $sum: { $size: '$items' } }
            }
        }
    ]);

    return {
        byStatus: stats,
        total: totalStats[0] || { totalOrders: 0, totalRevenue: 0, totalItems: 0 }
    };
};

/**
 * Thống kê đơn hàng theo ngày (cho biểu đồ Hành vi mua hàng)
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 */
const getOrderStatsByDate = async (startDate, endDate) => {
    const start = startDate ? new Date(startDate + 'T00:00:00.000Z') : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate + 'T23:59:59.999Z') : new Date();

    const result = await Order.aggregate([
        { $match: { created_at: { $gte: start, $lte: end } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                orderCount: { $sum: 1 },
                revenue: { $sum: '$total' }
            }
        },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', orderCount: 1, revenue: 1, _id: 0 } }
    ]);

    return result;
};

/**
 * Lấy chi tiết đơn hàng
 */
const getOrderDetail = async (orderId) => {
    const order = await Order.findById(orderId)
        .populate('customer')
        .populate('items.product');

    if (!order) {
        throw new Error('Không tìm thấy đơn hàng');
    }

    return order;
};

/**
 * Tạo đơn hàng mới
 */
const createOrder = async (orderData) => {
    const {
        customer,
        items,
        shippingAddress,
        paymentMethod,
        discountAmount,
        shippingFee,
        notes
    } = orderData;

    // Kiểm tra customer có tồn tại không
    const customerExists = await Customer.findById(customer);
    if (!customerExists) {
        throw new Error('Khách hàng không tồn tại');
    }

    // Validate và tính toán items
    let subtotal = 0;
    const orderItems = [];
    const sellerIds = new Set();

    for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
            throw new Error(`Sản phẩm ${item.product} không tồn tại`);
        }
        if (product.seller) sellerIds.add(String(product.seller));

        // Kiểm tra số lượng còn lại
        if (product.remainingQuantity < item.quantity) {
            throw new Error(`Sản phẩm ${product.name} không đủ số lượng. Còn lại: ${product.remainingQuantity}`);
        }

        const unitPrice = product.listedPrice;
        const discount = (unitPrice * product.discountPercent / 100) * item.quantity;
        const itemSubtotal = (unitPrice * item.quantity) - discount;

        orderItems.push({
            product: product._id,
            product_name: product.name,
            seller_id: product.seller || null, // Lưu seller để query orders khi product bị xóa
            quantity: item.quantity,
            unitPrice: unitPrice,
            price: unitPrice,
            discountAmount: discount,
            subtotal: itemSubtotal
        });

        subtotal += itemSubtotal;
    }

    // Tính tổng
    const totalDiscountAmount = parseFloat(discountAmount) || 0;
    const totalShippingFee = parseFloat(shippingFee) || 0;
    // Đảm bảo giảm giá không vượt quá subtotal và tổng không âm
    const maxDiscount = Math.min(totalDiscountAmount, subtotal);
    const total = Math.max(0, subtotal - maxDiscount + totalShippingFee);

    // Tạo orderNumber tự động
    const orderNumber = 'ORD' + Date.now().toString().slice(-8);

    const normalizePaymentMethod = (raw) => {
        const m = (raw ?? 'cash').toString().trim().toLowerCase();
        if (!m) return 'cash';
        if (m === 'cod' || m.includes('cash')) return 'cash';
        if (m.includes('vnpay') || m === 'vn-pay' || m === 'vn pay') return 'vnpay';
        // Fallback to schema default to avoid enum validation errors
        return 'cash';
    };

    const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);

    // Determine initial status based on payment method
    let initialStatus = 'Pending';
    if (normalizedPaymentMethod === 'vnpay') {
        initialStatus = 'WaitingPayment';
    }

    const order = new Order({
        orderNumber,
        customer,
        items: orderItems,
        shippingAddress,
        paymentMethod: normalizedPaymentMethod,
        subtotal,
        discountAmount: maxDiscount,
        shippingFee: totalShippingFee,
        total,
        final_price: total,
        notes: notes || '',
        status: initialStatus
    });

    await order.save();

    // Notify sellers (if the ordered products belong to sellers)
    if (sellerIds.size > 0) {
        const sellerNotiOps = Array.from(sellerIds).map((sellerId) =>
            Notification.create({
                title: `Đơn hàng mới ${orderNumber}`,
                content: `Bạn có một đơn hàng mới. Mã đơn: ${orderNumber}.`,
                type: 'system',
                priority: 'medium',
                target_audience: 'specific',
                target_users: [sellerId],
                status: 'active',
                created_by: customer,
                created_by_role: 'user',
                related_type: 'order',
                related_id: order._id,
                action_url: '/seller/orders',
                action_text: 'Xem đơn hàng',
            }).catch(() => null)
        );
        await Promise.allSettled(sellerNotiOps);
    }

    // Cập nhật số lượng sản phẩm và thống kê
    for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: {
                remainingQuantity: -item.quantity,
                soldQuantity: item.quantity,
                revenue: item.subtotal
            }
        });

        // Cập nhật status nếu hết hàng
        const updatedProduct = await Product.findById(item.product);
        if (updatedProduct.remainingQuantity <= 0) {
            updatedProduct.status = 'Hết hàng';
            await updatedProduct.save();
        }
    }

    // Cập nhật thống kê customer (Note: User model may not have orderCount/totalSpending fields)
    // This is optional - only update if these fields exist in User model
    try {
        await Customer.findByIdAndUpdate(customer, {
            $inc: {
                orderCount: 1,
                totalSpending: total
            }
        });
    } catch (err) {
        // Ignore if fields don't exist
        console.log('Note: User model may not have orderCount/totalSpending fields');
    }

    const savedOrder = await Order.findById(order._id)
        .populate('customer')
        .populate('items.product');

    return savedOrder;
};

/**
 * Cập nhật đơn hàng
 */
const updateOrder = async (orderId, orderData) => {
    const order = await Order.findById(orderId);

    if (!order) {
        throw new Error('Không tìm thấy đơn hàng');
    }

    const {
        status,
        paymentStatus,
        paymentMethod,
        shippingAddress,
        notes,
        cancelledReason
    } = orderData;

    // Cập nhật status
    if (status) {
        // Nếu hủy đơn hàng, hoàn lại số lượng sản phẩm
        if (status === 'cancelled' && order.status !== 'cancelled') {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: {
                        remainingQuantity: item.quantity,
                        soldQuantity: -item.quantity,
                        revenue: -item.subtotal
                    }
                });

                // Cập nhật status product
                const product = await Product.findById(item.product);
                if (product.remainingQuantity > 0 && product.status === 'Hết hàng') {
                    product.status = 'Còn hàng';
                    await product.save();
                }
            }

            // Cập nhật thống kê customer (Note: User model may not have orderCount/totalSpending fields)
            try {
                await Customer.findByIdAndUpdate(order.customer, {
                    $inc: {
                        orderCount: -1,
                        totalSpending: -order.total
                    }
                });
            } catch (err) {
                // Ignore if fields don't exist
                console.log('Note: User model may not have orderCount/totalSpending fields');
            }

            order.cancelledReason = cancelledReason || '';
        }

        order.status = status;
    }

    if (paymentStatus) {
        order.paymentStatus = paymentStatus;
        order.payment_status = paymentStatus;
    }
    if (paymentMethod) {
        const m = paymentMethod.toString().trim().toLowerCase();
        const normalized =
            m === 'cod' || m.includes('cash')
                ? 'cash'
                : (m.includes('vnpay') || m === 'vn-pay' || m === 'vn pay')
                    ? 'vnpay'
                    : 'cash';

        order.paymentMethod = normalized;
        order.payment_method = normalized;
    }
    if (shippingAddress) order.shippingAddress = shippingAddress;
    if (notes !== undefined) {
        order.notes = notes;
        order.note = notes;
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
        .populate('customer')
        .populate('items.product');

    return updatedOrder;
};

/**
 * Xóa đơn hàng
 */
const deleteOrder = async (orderId) => {
    const order = await Order.findById(orderId);

    if (!order) {
        throw new Error('Không tìm thấy đơn hàng');
    }

    // Chỉ cho phép xóa khi status là "pending", "Pending", "WaitingPayment" hoặc "Chờ xác nhận"
    const allowedStatuses = ['pending', 'Pending', 'WaitingPayment', 'Chờ xác nhận'];
    if (!allowedStatuses.includes(order.status)) {
        throw new Error('Chỉ có thể xóa đơn hàng ở trạng thái chờ thanh toán hoặc chờ xác nhận');
    }

    // Hoàn lại số lượng sản phẩm
    for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: {
                remainingQuantity: item.quantity,
                soldQuantity: -item.quantity,
                revenue: -item.subtotal
            }
        });
    }

    // Cập nhật thống kê customer (Note: User model may not have orderCount/totalSpending fields)
    try {
        await Customer.findByIdAndUpdate(order.customer, {
            $inc: {
                orderCount: -1,
                totalSpending: -order.total
            }
        });
    } catch (err) {
        // Ignore if fields don't exist
        console.log('Note: User model may not have orderCount/totalSpending fields');
    }

    await Order.findByIdAndDelete(orderId);
};

module.exports = {
    getOrders,
    getOrderStats,
    getOrderStatsByDate,
    getOrderDetail,
    createOrder,
    updateOrder,
    deleteOrder
};

