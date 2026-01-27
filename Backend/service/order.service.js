const Order = require('../model/order');
const Product = require('../model/product');
const User = require('../model/user');

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

    for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
            throw new Error(`Sản phẩm ${item.product} không tồn tại`);
        }

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

    // Determine initial status based on payment method
    let initialStatus = 'Pending';
    const method = (paymentMethod || 'cash').toLowerCase();

    if (method.includes('vnpay') || method === 'vnpay') {
        initialStatus = 'WaitingPayment';
    } else {
        // Default (Cash, Payment cash)
        initialStatus = 'Pending';
    }

    const order = new Order({
        orderNumber,
        customer,
        items: orderItems,
        shippingAddress,
        paymentMethod: paymentMethod || 'COD',
        subtotal,
        discountAmount: maxDiscount,
        shippingFee: totalShippingFee,
        total,
        final_price: total,
        notes: notes || '',
        status: initialStatus
    });

    await order.save();

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
        order.paymentMethod = paymentMethod;
        order.payment_method = paymentMethod;
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
    getOrderDetail,
    createOrder,
    updateOrder,
    deleteOrder
};

