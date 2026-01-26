const express = require('express');
const router = express.Router();
const sellerProductController = require('../controller/sellerProduct.controller');
const protectRoute = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer configuration for product images
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
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
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
}).array('images', 5); // Max 5 images

const uploadMiddleware = (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'Lỗi upload file'
            });
        }
        next();
    });
};

// All routes require seller authentication
router.get('/', protectRoute(['seller']), sellerProductController.getSellerProducts);
router.post('/', protectRoute(['seller']), uploadMiddleware, sellerProductController.createSellerProduct);
router.get('/:id', protectRoute(['seller']), sellerProductController.getSellerProductById);
router.put('/:id', protectRoute(['seller']), uploadMiddleware, sellerProductController.updateSellerProduct);
router.delete('/:id', protectRoute(['seller']), sellerProductController.deleteSellerProduct);
router.patch('/:id/stock', protectRoute(['seller']), sellerProductController.updateStock);

module.exports = router;
