const productService = require('../service/product.service');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình multer để lưu ảnh
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/images/products');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh!'));
        }
    }
}).array('images', 5);

// Middleware upload
const uploadMiddleware = (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        next();
    });
};

/**
 * GET /api/products - Lấy danh sách sản phẩm với phân trang và tìm kiếm
 */
const getProducts = async (req, res, next) => {
    try {
        const result = await productService.getProducts(req.query);
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
 * GET /api/products/:id - Lấy chi tiết sản phẩm
 */
const getProductDetail = async (req, res, next) => {
    try {
        const product = await productService.getProductDetail(req.params.id);
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        if (error.message === 'Không tìm thấy sản phẩm') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};

/**
 * POST /api/products - Tạo sản phẩm mới
 */
const createProduct = async (req, res, next) => {
    try {
        const product = await productService.createProduct(req.body, req.files);
        res.status(201).json({
            success: true,
            message: 'Thêm sản phẩm thành công',
            data: product
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/products/:id - Cập nhật sản phẩm
 */
const updateProduct = async (req, res, next) => {
    try {
        console.log('Update product - Received details:', req.body.details);
        console.log('Update product - Body keys:', Object.keys(req.body));
        const product = await productService.updateProduct(req.params.id, req.body, req.files);
        console.log('Update product - Saved details:', product.details);
        res.json({
            success: true,
            message: 'Cập nhật sản phẩm thành công',
            data: product
        });
    } catch (error) {
        if (error.message === 'Không tìm thấy sản phẩm') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};

/**
 * DELETE /api/products/:id - Xóa sản phẩm
 */
const deleteProduct = async (req, res, next) => {
    try {
        await productService.deleteProduct(req.params.id);
        res.json({
            success: true,
            message: 'Xóa sản phẩm thành công'
        });
    } catch (error) {
        if (error.message === 'Không tìm thấy sản phẩm') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};

/**
 * GET /api/products/stats/revenue - Lấy thống kê doanh thu
 */
const getRevenueStats = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const stats = await productService.getRevenueStats(startDate, endDate);
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/products/:id/approve - Duyệt sản phẩm
 */
const approveProduct = async (req, res, next) => {
    try {
        const product = await productService.approveProduct(req.params.id);
        res.json({
            success: true,
            message: 'Duyệt sản phẩm thành công',
            data: product
        });
    } catch (error) {
        if (error.message === 'Không tìm thấy sản phẩm') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};

/**
 * PUT /api/products/:id/reject - Từ chối sản phẩm
 */
const rejectProduct = async (req, res, next) => {
    try {
        const product = await productService.rejectProduct(req.params.id);
        res.json({
            success: true,
            message: 'Từ chối sản phẩm thành công',
            data: product
        });
    } catch (error) {
        if (error.message === 'Không tìm thấy sản phẩm') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};

module.exports = {
    getProducts,
    getProductDetail,
    createProduct,
    updateProduct,
    deleteProduct,
    getRevenueStats,
    uploadMiddleware,
    approveProduct,
    rejectProduct
};

