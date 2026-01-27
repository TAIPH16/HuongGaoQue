const Product = require('../model/product');
const Order = require('../model/order');

/**
 * Lấy danh sách stock của seller
 */
exports.getStockList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const statusFilter = req.query.status; // 'Còn hàng', 'Hết hàng', 'Đang tính'

        let query = { seller: req.userId };

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (statusFilter) {
            query.status = statusFilter;
        }

        const products = await Product.find(query)
            .populate('category')
            .select('name productId category initialQuantity remainingQuantity unit status soldQuantity images')
            .skip(skip)
            .limit(limit)
            .sort({ updatedAt: -1 });

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalProducts: total,
                limit: limit
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * Lấy chi tiết stock của một sản phẩm
 */
exports.getStockDetail = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            seller: req.userId
        })
        .populate('category')
        .select('name productId category initialQuantity remainingQuantity unit status soldQuantity revenue images createdAt updatedAt');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Lấy lịch sử thay đổi stock từ orders
        const stockMovements = await Order.find({
            'items.product': product._id,
            status: { $in: ['paid', 'processing', 'shipping', 'completed'] }
        })
        .select('orderNumber items status createdAt')
        .sort({ createdAt: -1 })
        .limit(20);

        res.status(200).json({
            success: true,
            data: {
                product,
                stockMovements
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * Cập nhật số lượng stock
 */
exports.updateStock = async (req, res) => {
    try {
        const { remainingQuantity, initialQuantity } = req.body;

        if (remainingQuantity === undefined && initialQuantity === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp remainingQuantity hoặc initialQuantity'
            });
        }

        const product = await Product.findOne({
            _id: req.params.id,
            seller: req.userId
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Cập nhật remainingQuantity
        if (remainingQuantity !== undefined) {
            if (remainingQuantity < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Số lượng không thể âm'
                });
            }
            product.remainingQuantity = remainingQuantity;
        }

        // Cập nhật initialQuantity
        if (initialQuantity !== undefined) {
            if (initialQuantity < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Số lượng ban đầu không thể âm'
                });
            }
            product.initialQuantity = initialQuantity;
        }

        // Tự động cập nhật status
        product.updateStatus();
        await product.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật số lượng kho thành công',
            data: product
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * Tạo bản ghi stock mới (thêm stock vào sản phẩm)
 */
exports.addStock = async (req, res) => {
    try {
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Số lượng phải lớn hơn 0'
            });
        }

        const product = await Product.findOne({
            _id: req.params.id,
            seller: req.userId
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Thêm vào remainingQuantity và initialQuantity
        product.remainingQuantity += quantity;
        product.initialQuantity += quantity;

        // Tự động cập nhật status
        product.updateStatus();
        await product.save();

        res.status(200).json({
            success: true,
            message: `Đã thêm ${quantity} ${product.unit} vào kho`,
            data: product
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * Lấy lịch sử thay đổi stock
 */
exports.getStockHistory = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            seller: req.userId
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Lấy tất cả orders có chứa sản phẩm này
        const orders = await Order.find({
            'items.product': product._id
        })
        .populate('customer', 'name email')
        .select('orderNumber items status paymentStatus createdAt')
        .sort({ createdAt: -1 })
        .limit(50);

        // Format stock movements
        const stockMovements = orders.map(order => {
            const item = order.items.find(i => i.product.toString() === product._id.toString());
            return {
                type: order.status === 'cancelled' ? 'return' : 'sale',
                orderNumber: order.orderNumber,
                quantity: item ? item.quantity : 0,
                status: order.status,
                paymentStatus: order.paymentStatus,
                customer: order.customer,
                date: order.createdAt
            };
        });

        res.status(200).json({
            success: true,
            data: {
                product: {
                    name: product.name,
                    productId: product.productId,
                    currentStock: product.remainingQuantity,
                    initialQuantity: product.initialQuantity,
                    soldQuantity: product.soldQuantity
                },
                movements: stockMovements
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

