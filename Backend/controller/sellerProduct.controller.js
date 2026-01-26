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

// Create new product by seller
exports.createSellerProduct = async (req, res) => {
    try {
        const {
            name,
            category,
            listedPrice,
            discountPercent,
            description,
            initialQuantity,
            unit,
            status,
            allowComments,
            details
        } = req.body;

        if (!name || !category || !listedPrice || !initialQuantity) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập đủ tên, danh mục, giá niêm yết và số lượng đầu vào'
            });
        }

        // Handle images from multer
        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => `/images/products/${file.filename}`);
        }

        // Parse details if provided as JSON string
        let parsedDetails = [];
        if (details) {
            try {
                parsedDetails = typeof details === 'string' ? JSON.parse(details) : details;
                if (!Array.isArray(parsedDetails)) parsedDetails = [];
            } catch (e) {
                parsedDetails = [];
            }
        }

        // Generate productId like admin flow
        const productId = 'PRD' + Date.now().toString().slice(-8);

        const product = await Product.create({
            productId,
            name: name.trim(),
            category,
            listedPrice: Number(listedPrice),
            discountPercent: discountPercent ? Number(discountPercent) : 0,
            description: description || '',
            images,
            initialQuantity: Number(initialQuantity),
            remainingQuantity: Number(initialQuantity),
            unit: unit || 'kg',
            status: status || 'Còn hàng',
            allowComments: allowComments === 'false' ? false : true,
            details: parsedDetails,
            seller: req.userId,
            is_approved: false // require admin approval
        });

        res.status(201).json({
            success: true,
            message: 'Tạo sản phẩm thành công! Vui lòng đợi admin duyệt.',
            data: product
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
