const express = require('express');
const router = express.Router();
const userService = require('../service/user.service');
const protectRoute = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình multer để lưu avatar user
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/images/users');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'user-' + uniqueSuffix + path.extname(file.originalname));
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
}).single('avatar'); // Field name cho avatar

// Middleware upload với error handling
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

// Admin self-update profile (requires admin authentication)
router.put('/admin', protectRoute(['admin']), uploadMiddleware, async (req, res, next) => {
    try {
        // Lấy dữ liệu từ form (có thể là FormData)
        const userData = {
            fullName: req.body.fullName || req.body.name,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            region: req.body.region, // Thêm region trực tiếp
            address: req.body.address, // Có thể là JSON string
            dateOfBirth: req.body.dateOfBirth,
            settlementAccount: req.body.settlementAccount,
            businessInfo: req.body.businessInfo,
            accountSettings: req.body.accountSettings,
            securitySettings: req.body.securitySettings,
            deleteAvatar: req.body.deleteAvatar,
        };

        // Debug: Log data being sent
        console.log('Updating admin profile with data:', {
            userId: req.user._id.toString(),
            fullName: userData.fullName,
            phoneNumber: userData.phoneNumber,
            address: userData.address,
            region: userData.region
        });

        // Update current user's profile using service
        // req.file là multer file object (có filename, path, ...)
        const updatedUser = await userService.updateUser(req.user._id.toString(), userData, req.file || null);
        
        // Debug: Log returned data
        console.log('Updated user data:', {
            fullName: updatedUser.fullName,
            phoneNumber: updatedUser.phoneNumber,
            address: updatedUser.address,
            region: updatedUser.region
        });
        
        res.json({
            success: true,
            message: 'Cập nhật thông tin thành công',
            data: updatedUser
        });
    } catch (error) {
        console.error('Error updating admin profile:', error);
        if (error.message === 'Không tìm thấy người dùng' || error.message === 'Email đã được sử dụng') {
            return res.status(error.message === 'Không tìm thấy người dùng' ? 404 : 400).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
});

// Customer self-update profile (requires customer authentication - role 'user')
router.put('/customer', protectRoute(['user']), uploadMiddleware, async (req, res, next) => {
    try {
        // Lấy dữ liệu từ form (có thể là FormData)
        const userData = {
            fullName: req.body.fullName || req.body.name,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            region: req.body.region, // Thêm region trực tiếp
            address: req.body.address, // Có thể là JSON string
            dateOfBirth: req.body.dateOfBirth,
            deleteAvatar: req.body.deleteAvatar,
        };

        // Update current user's profile using service
        // req.file là multer file object (có filename, path, ...)
        const updatedUser = await userService.updateUser(req.user._id.toString(), userData, req.file || null);
        
        res.json({
            success: true,
            message: 'Cập nhật thông tin thành công',
            data: updatedUser
        });
    } catch (error) {
        console.error('Error updating customer profile:', error);
        if (error.message === 'Không tìm thấy người dùng' || error.message === 'Email đã được sử dụng') {
            return res.status(error.message === 'Không tìm thấy người dùng' ? 404 : 400).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
});

module.exports = router;
