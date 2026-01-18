const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const protectRoute = require("../middleware/auth.middleware");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer configuration for user avatar uploads
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

// Route cho /api/users/customers (giữ nguyên)
router.get("/customers", protectRoute(['admin']), userController.getCustomers);

// Routes cho /api/customers - mount root route
router.get("/", protectRoute(['admin']), userController.getCustomers); // GET /api/customers
router.get("/stats/summary", protectRoute(['admin']), userController.getCustomerStats);
router.get("/:id", protectRoute(['admin']), userController.getCustomerById);
// Update customer route - must be before /:id/ban to avoid conflict
router.put("/:id", protectRoute(['admin']), uploadMiddleware, userController.updateCustomer);
// Ban/Unban routes - hỗ trợ cả POST và PATCH
router.post("/:id/ban", protectRoute(['admin']), userController.banCustomer);
router.patch("/:id/ban", protectRoute(['admin']), userController.banCustomer);
router.post("/:id/unban", protectRoute(['admin']), userController.unbanCustomer);
router.patch("/:id/unban", protectRoute(['admin']), userController.unbanCustomer);
// Hide/Unhide routes
router.post("/:id/hide", protectRoute(['admin']), userController.hideCustomer);
router.patch("/:id/hide", protectRoute(['admin']), userController.hideCustomer);
router.post("/:id/unhide", protectRoute(['admin']), userController.unhideCustomer);
router.patch("/:id/unhide", protectRoute(['admin']), userController.unhideCustomer);
// ... các route khác nếu cần
console.log(userController);
module.exports = router;
