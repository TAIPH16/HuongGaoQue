const express = require("express");
const router = express.Router();
const sellerController = require("../controller/seller.controller");
const protectRoute = require("../middleware/auth.middleware");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer configuration for seller avatar uploads
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

// Routes for sellers
router.get("/", protectRoute(['admin']), sellerController.getSellers);
router.get("/stats/summary", protectRoute(['admin']), sellerController.getSellerStats);
router.get("/:id", protectRoute(['admin']), sellerController.getSellerById);
router.put("/:id", protectRoute(['admin']), uploadMiddleware, sellerController.updateSeller);

// Approve/Reject seller
router.post("/:id/approve", protectRoute(['admin']), sellerController.approveSeller);
router.post("/:id/reject", protectRoute(['admin']), sellerController.rejectSeller);

// Ban/Unban routes
router.post("/:id/ban", protectRoute(['admin']), sellerController.banSeller);
router.patch("/:id/ban", protectRoute(['admin']), sellerController.banSeller);
router.post("/:id/unban", protectRoute(['admin']), sellerController.unbanSeller);
router.patch("/:id/unban", protectRoute(['admin']), sellerController.unbanSeller);

// Hide/Unhide routes
router.post("/:id/hide", protectRoute(['admin']), sellerController.hideSeller);
router.patch("/:id/hide", protectRoute(['admin']), sellerController.hideSeller);
router.post("/:id/unhide", protectRoute(['admin']), sellerController.unhideSeller);
router.patch("/:id/unhide", protectRoute(['admin']), sellerController.unhideSeller);

module.exports = router;
