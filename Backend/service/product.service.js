const Product = require('../model/product');
const Category = require('../model/category');
const path = require('path');
const fs = require('fs');

/**
 * Lấy danh sách sản phẩm với phân trang và filter
 */
const getProducts = async (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = query.search || '';
    const categoryId = query.categoryId;
    const status = query.status;

    // Tạo query
    let filter = {};
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { productId: { $regex: search, $options: 'i' } }
        ];
    }
    if (categoryId) {
        filter.category = categoryId;
    }
    if (status) {
        filter.status = status;
    }

    const products = await Product.find(filter)
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Product.countDocuments(filter);

    return {
        data: products,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalProducts: total,
            limit: limit
        }
    };
};

/**
 * Lấy chi tiết sản phẩm theo ID
 */
const getProductDetail = async (productId) => {
    const product = await Product.findById(productId).populate('category');

    if (!product) {
        throw new Error('Không tìm thấy sản phẩm');
    }

    return product;
};

/**
 * Tạo sản phẩm mới
 */
const createProduct = async (productData, files) => {
    const {
        name,
        category,
        listedPrice,
        discountPercent,
        description,
        initialQuantity,
        unit,
        status,
        details,
        allowComments
    } = productData;

    // Kiểm tra category có tồn tại không
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
        throw new Error('Danh mục không tồn tại');
    }

    // Tạo productId tự động
    const productId = 'PRD' + Date.now().toString().slice(-8);

    // Xử lý ảnh
    const images = files ? files.map(file => '/images/products/' + file.filename) : [];

    // Parse details nếu là string
    let parsedDetails = [];
    if (details) {
        parsedDetails = typeof details === 'string' ? JSON.parse(details) : details;
    }

    // Tính remainingQuantity từ initialQuantity
    const remainingQuantity = parseInt(initialQuantity) || 0;

    const product = new Product({
        productId,
        name,
        category,
        listedPrice: parseFloat(listedPrice),
        discountPercent: parseFloat(discountPercent) || 0,
        description: description || '',
        images,
        initialQuantity: parseInt(initialQuantity) || 0,
        remainingQuantity,
        unit: unit || 'kg',
        status: status || 'Còn hàng',
        details: parsedDetails,
        allowComments: allowComments !== undefined ? allowComments : true,
        updatedAt: new Date()
    });

    // Cập nhật status dựa trên quantity
    product.updateStatus();

    await product.save();

    // Cập nhật productCount của category
    await Category.findByIdAndUpdate(category, {
        $inc: { productCount: 1 }
    });

    const savedProduct = await Product.findById(product._id).populate('category');
    return savedProduct;
};

/**
 * Cập nhật sản phẩm
 */
const updateProduct = async (productId, productData, files) => {
    const product = await Product.findById(productId);

    if (!product) {
        throw new Error('Không tìm thấy sản phẩm');
    }

    const {
        name,
        category,
        listedPrice,
        discountPercent,
        description,
        initialQuantity,
        unit,
        status,
        details,
        allowComments,
        imagesToDelete
    } = productData;

    // Xử lý ảnh mới
    if (files && files.length > 0) {
        const newImages = files.map(file => '/images/products/' + file.filename);
        product.images = [...product.images, ...newImages];
    }

    // Xóa ảnh được yêu cầu
    if (imagesToDelete) {
        const imagesToDeleteArray = typeof imagesToDelete === 'string'
            ? JSON.parse(imagesToDelete)
            : imagesToDelete;

        imagesToDeleteArray.forEach(imagePath => {
            const filePath = path.join(__dirname, '..', 'public', imagePath);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            product.images = product.images.filter(img => img !== imagePath);
        });
    }

    // Cập nhật các trường khác
    if (name) product.name = name;
    if (category) {
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            throw new Error('Danh mục không tồn tại');
        }
        // Cập nhật productCount của category cũ và mới
        if (product.category.toString() !== category) {
            await Category.findByIdAndUpdate(product.category, {
                $inc: { productCount: -1 }
            });
            await Category.findByIdAndUpdate(category, {
                $inc: { productCount: 1 }
            });
        }
        product.category = category;
    }
    if (listedPrice !== undefined) product.listedPrice = parseFloat(listedPrice);
    if (discountPercent !== undefined) product.discountPercent = parseFloat(discountPercent);
    if (description !== undefined) product.description = description;
    if (initialQuantity !== undefined) {
        product.initialQuantity = parseInt(initialQuantity);
        product.remainingQuantity = parseInt(initialQuantity);
    }
    if (unit) product.unit = unit;
    if (status) product.status = status;
    // Luôn cập nhật details nếu có trong request (kể cả empty array)
    if (details !== undefined) {
        try {
            let parsedDetails = [];
            if (typeof details === 'string') {
                // Nếu là string rỗng hoặc chỉ có whitespace hoặc "[]", dùng empty array
                const trimmed = details.trim();
                if (trimmed === '' || trimmed === '[]' || trimmed === 'null') {
                    parsedDetails = [];
                } else {
                    parsedDetails = JSON.parse(details);
                    // Đảm bảo là array
                    if (!Array.isArray(parsedDetails)) {
                        parsedDetails = [];
                    }
                }
            } else if (Array.isArray(details)) {
                parsedDetails = details;
            } else if (details === null) {
                parsedDetails = [];
            }
            console.log('Updating product details - Parsed:', parsedDetails);
            console.log('Updating product details - Count:', parsedDetails.length);
            product.details = parsedDetails;
        } catch (error) {
            console.error('Error parsing details:', error, 'Raw details:', details);
            // Nếu parse lỗi, dùng empty array thay vì giữ nguyên (tránh lỗi validation)
            product.details = [];
        }
    } else {
        // Nếu details không có trong request, giữ nguyên details cũ
        console.log('Details not in request, keeping existing details:', product.details);
    }
    if (allowComments !== undefined) product.allowComments = allowComments;

    // Cập nhật status dựa trên quantity
    product.updateStatus();
    product.updatedAt = new Date();

    await product.save();

    const updatedProduct = await Product.findById(product._id).populate('category');
    return updatedProduct;
};

/**
 * Xóa sản phẩm
 */
const deleteProduct = async (productId) => {
    const product = await Product.findById(productId);

    if (!product) {
        throw new Error('Không tìm thấy sản phẩm');
    }

    // Xóa ảnh
    product.images.forEach(imagePath => {
        const filePath = path.join(__dirname, '..', 'public', imagePath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    });

    // Cập nhật productCount của category
    await Category.findByIdAndUpdate(product.category, {
        $inc: { productCount: -1 }
    });

    await Product.findByIdAndDelete(productId);
};

/**
 * Lấy thống kê doanh thu
 */
const getRevenueStats = async (startDate, endDate) => {
    let query = {};
    if (startDate && endDate) {
        query.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const stats = await Product.aggregate([
        { $match: query },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$revenue' },
                totalProducts: { $sum: 1 },
                totalSold: { $sum: '$soldQuantity' }
            }
        }
    ]);

    return stats[0] || { totalRevenue: 0, totalProducts: 0, totalSold: 0 };
};

/**
 * Duyệt sản phẩm (Admin)
 */
const approveProduct = async (productId) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new Error('Không tìm thấy sản phẩm');
    }
    product.is_approved = true;
    await product.save();
    return product;
};

/**
 * Từ chối/Bỏ duyệt sản phẩm (Admin)
 */
const rejectProduct = async (productId) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new Error('Không tìm thấy sản phẩm');
    }
    product.is_approved = false;
    await product.save();
    return product;
};

module.exports = {
    getProducts,
    getProductDetail,
    createProduct,
    updateProduct,
    deleteProduct,
    getRevenueStats,
    approveProduct,
    rejectProduct
};

