const Order = require('../model/order');
const Product = require('../model/product');

// Get seller's orders (orders containing seller's products)
exports.getSellerOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const skip = (page - 1) * limit;
        const status = req.query.status;

        // Find all orders that contain at least one item from this seller
        let query = {
            'items.product': {
                $in: await Product.find({ seller: req.userId }).distinct('_id')
            }
        };

        if (status) {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate('customer', 'name email phoneNumber')
            .populate('items.product')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

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
        const sellerProducts = await Product.find({ seller: req.userId }).distinct('_id');
        const hasSellerItems = order.items.some(item =>
            sellerProducts.some(prodId => prodId.equals(item.product._id))
        );

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
            status: { $in: ['Completed', 'Delivered'] }
        });

        let totalRevenue = 0;
        let totalOrders = orders.length;
        let totalProductsSold = 0;

        orders.forEach(order => {
            order.items.forEach(item => {
                if (productIds.some(id => id.equals(item.product))) {
                    totalRevenue += item.subtotal || (item.unitPrice * item.quantity);
                    totalProductsSold += item.quantity;
                }
            });
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
                products: sellerProducts
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
