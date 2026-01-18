const express = require('express');
const router = express.Router();
const sellerAuthController = require('../controller/sellerAuth.controller');
const protectRoute = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer configuration for seller avatar
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/images/sellers');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'seller-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
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
}).single('avatar');

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

// Public routes
router.post('/register', sellerAuthController.registerSeller);
router.post('/login', sellerAuthController.loginSeller);

// Protected routes (require seller auth)
router.get('/profile', protectRoute(['seller']), sellerAuthController.getSellerProfile);
router.put('/profile', protectRoute(['seller']), uploadMiddleware, sellerAuthController.updateSellerProfile);

module.exports = router;
