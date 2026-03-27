const Order = require('../model/order');
const Product = require('../model/product');
const Notification = require('../model/notification');

// Get seller's orders (orders containing seller's products)
exports.getSellerOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const skip = (page - 1) * limit;
        const status = req.query.status;

        // Tìm orders có sản phẩm của seller này
        // Dùng 2 điều kiện với $or:
        //  1. items.seller_id (cho orders mới sau khi fix)
        //  2. items.product nằm trong danh sách product (kể cả isDeleted) (cho orders cũ)
        const allSellerProductIds = await Product.find({ seller: req.userId }).distinct('_id');

        let query = {
            $or: [
                { 'items.seller_id': req.userId },
                { 'items.product': { $in: allSellerProductIds } }
            ]
        };

        if (status) {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate('customer', 'name email phoneNumber')
            .populate('items.product')
            .skip(skip)
            .limit(limit)
            .sort({ created_at: -1 });

        const total = await Order.countDocuments(query);

        res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalOrders: total,
                limit: limit
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get single order detail
exports.getSellerOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer', 'name email phoneNumber address')
            .populate('items.product');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Check if seller has items in this order
        // Kiểm tra bằng seller_id trong item (orders mới) hoặc bằng product.seller (orders cũ)
        const allSellerProductIds = await Product.find({ seller: req.userId }).distinct('_id');
        const hasSellerItems = order.items.some(item => {
            // Ưu tiên kiểm tra seller_id trực tiếp
            if (item.seller_id && String(item.seller_id) === String(req.userId)) return true;
            // Fallback: kiểm tra qua product (kể cả product đã bị soft-deleted)
            if (item.product) {
                const productId = item.product._id || item.product;
                return allSellerProductIds.some(pid => pid.equals(productId));
            }
            return false;
        });

        if (!hasSellerItems) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xem đơn hàng này'
            });
        }

        res.status(200).json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Seller dashboard stats
exports.getSellerDashboard = async (req, res) => {
    try {
        // Get seller's products
        const sellerProducts = await Product.find({ seller: req.userId });
        const productIds = sellerProducts.map(p => p._id);

        // Calculate total revenue from orders
        const orders = await Order.find({
            'items.product': { $in: productIds },
            status: { $in: ['completed', 'shipping'] }
        });

        let totalRevenue = 0;
        let totalOrders = orders.length;
        let totalProductsSold = 0;

        // Initialize per-product stats
        let productStats = {};
        sellerProducts.forEach(p => {
            productStats[p._id.toString()] = {
                revenue: 0,
                soldCount: 0,
                views: p.viewCount || 0
            };
        });

        orders.forEach(order => {
            order.items.forEach(item => {
                const pId = item.product ? item.product.toString() : null;
                if (pId && productStats[pId]) {
                    const itemRevenue = item.subtotal || (item.unitPrice * item.quantity);
                    totalRevenue += itemRevenue;
                    totalProductsSold += item.quantity;

                    productStats[pId].revenue += itemRevenue;
                    productStats[pId].soldCount += item.quantity;
                }
            });
        });

        // Attach stats to products
        const productsWithStats = sellerProducts.map(p => {
            const pObj = p.toObject ? p.toObject() : p;
            const statsObj = productStats[p._id.toString()];
            return {
                ...pObj,
                revenue: statsObj.revenue,
                soldCount: statsObj.soldCount,
                views: statsObj.views
            };
        });

        // Get pending orders
        const pendingOrders = await Order.countDocuments({
            'items.product': { $in: productIds },
            status: { $in: ['Pending', 'WaitingPayment', 'WaitingConfirm'] }
        });

        // Product stats
        const totalProducts = sellerProducts.length;
        const outOfStockProducts = sellerProducts.filter(p => p.remainingQuantity === 0).length;

        res.status(200).json({
            success: true,
            data: {
                totalRevenue,
                totalOrders,
                totalProductsSold,
                pendingOrders,
                totalProducts,
                outOfStockProducts,
                products: productsWithStats.sort((a, b) => b.soldCount - a.soldCount)
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update order status by seller (only if all items belong to this seller)
exports.updateSellerOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status, cancelledReason } = req.body;
        if (!status) {
            return res.status(400).json({ success: false, message: 'Thiếu trạng thái cần cập nhật' });
        }

        const order = await Order.findById(orderId).populate('items.product');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        // Ensure ALL items belong to this seller
        // Kiểm tra bằng seller_id (orders mới) hoặc product.seller (orders cũ)
        const notOwned = order.items.find(it => {
            // Nếu có seller_id trong item, kiểm tra trực tiếp
            if (it.seller_id) return String(it.seller_id) !== String(req.userId);
            // Fallback: kiểm tra qua product (có thể null nếu product đã bị xóa hẳn)
            return String(it.product?.seller || '') !== String(req.userId);
        });
        if (notOwned) {
            return res.status(403).json({
                success: false,
                message: 'Đơn hàng chứa sản phẩm không thuộc bạn. Vui lòng liên hệ Admin để xử lý.'
            });
        }

        const current = order.status;
        const allowedTransitions = new Set([
            `${'Pending'}->${'WaitingConfirm'}`,
            `${'WaitingPayment'}->${'WaitingConfirm'}`,
            `${'WaitingConfirm'}->${'shipping'}`,
            `${'processing'}->${'shipping'}`,
            `${'shipping'}->${'completed'}`,
            `${'Pending'}->${'Cancelled'}`,
            `${'WaitingPayment'}->${'Cancelled'}`,
            `${'WaitingConfirm'}->${'Cancelled'}`
        ]);

        const key = `${current}->${status}`;
        if (!allowedTransitions.has(key)) {
            return res.status(400).json({
                success: false,
                message: `Không thể chuyển trạng thái từ ${current} sang ${status}`
            });
        }

        order.status = status;
        if (status === 'Cancelled' && cancelledReason) {
            order.cancelledReason = cancelledReason;
        }
        await order.save();

        // Notify customer about status change
        try {
            const customerId = order.customer;
            if (customerId) {
                await Notification.create({
                    title: `Cập nhật đơn hàng ${order.orderNumber}`,
                    content:
                        status === 'Cancelled'
                            ? `Đơn hàng ${order.orderNumber} đã bị hủy.${cancelledReason ? ` Lý do: ${cancelledReason}` : ''}`
                            : `Trạng thái đơn hàng ${order.orderNumber} đã được cập nhật: ${status}.`,
                    type: 'system',
                    priority: 'medium',
                    target_audience: 'specific',
                    target_users: [customerId],
                    status: 'active',
                    created_by: req.userId,
                    created_by_role: 'seller',
                    related_type: 'order',
                    related_id: order._id,
                    action_url: '/don-hang',
                    action_text: 'Xem đơn hàng',
                });
            }
        } catch (e) { /* ignore notification errors */ }

        const saved = await Order.findById(order._id)
            .populate('customer', 'name email phoneNumber')
            .populate('items.product');

        res.json({ success: true, message: 'Cập nhật trạng thái thành công', data: saved });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
