const Product = require('../model/product');

// Get seller's own products
exports.getSellerProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        let query = { seller: req.userId }; // Only seller's products

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const products = await Product.find(query)
            .populate('category')
            .skip(skip)
            .limit(limit)
            .sort({ created_at: -1 });

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

// Get single product (only if owned by seller)
exports.getSellerProductById = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            seller: req.userId
        }).populate('category');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        res.status(200).json({ success: true, data: product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// Update product (only if owned by seller)
exports.updateSellerProduct = async (req, res) => {
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

        // Update fields
        Object.keys(req.body).forEach(key => {
            if (key !== 'seller' && key !== 'is_approved') { // Don't allow changing seller or approval status
                product[key] = req.body[key];
            }
        });

        // Handle new images if uploaded
        if (req.files && req.files.length > 0) {
            product.images = req.files.map(file => `/images/products/${file.filename}`);
        }

        // Set back to pending approval if significant changes
        product.is_approved = false;

        await product.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật sản phẩm thành công! Vui lòng đợi admin duyệt lại.',
            data: product
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete product (only if owned by seller)
exports.deleteSellerProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            seller: req.userId
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Xóa sản phẩm thành công'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update stock quantity
exports.updateStock = async (req, res) => {
    try {
        const { stock } = req.body;

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

        product.stock = stock;
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
