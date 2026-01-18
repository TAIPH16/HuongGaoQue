const postService = require('../service/post.service');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình multer để lưu ảnh bìa
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/images/posts');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'post-' + uniqueSuffix + path.extname(file.originalname));
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
}).single('coverImage');

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
 * GET /api/posts - Lấy danh sách bài viết
 */
const getPosts = async (req, res, next) => {
    try {
        const result = await postService.getPosts(req.query);
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
 * GET /api/posts/:id - Lấy chi tiết bài viết
 */
const getPostDetail = async (req, res, next) => {
    try {
        const post = await postService.getPostDetail(req.params.id);
        res.json({
            success: true,
            data: post
        });
    } catch (error) {
        if (error.message === 'Không tìm thấy bài viết') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};

/**
 * POST /api/posts - Tạo bài viết mới
 */
const createPost = async (req, res, next) => {
    try {
        const post = await postService.createPost(req.body, req.file);
        res.status(201).json({
            success: true,
            message: 'Tạo bài viết thành công',
            data: post
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/posts/:id - Cập nhật bài viết
 */
const updatePost = async (req, res, next) => {
    try {
        const post = await postService.updatePost(req.params.id, req.body, req.file);
        res.json({
            success: true,
            message: 'Cập nhật bài viết thành công',
            data: post
        });
    } catch (error) {
        if (error.message === 'Không tìm thấy bài viết') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};

/**
 * DELETE /api/posts/:id - Xóa bài viết
 */
const deletePost = async (req, res, next) => {
    try {
        await postService.deletePost(req.params.id);
        res.json({
            success: true,
            message: 'Xóa bài viết thành công'
        });
    } catch (error) {
        if (error.message === 'Không tìm thấy bài viết') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};

/**
 * POST /api/posts/:id/increment-view - Tăng lượt xem
 */
const incrementView = async (req, res, next) => {
    try {
        const result = await postService.incrementView(req.params.id);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        if (error.message === 'Không tìm thấy bài viết') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};

module.exports = {
    getPosts,
    getPostDetail,
    createPost,
    updatePost,
    deletePost,
    incrementView,
    uploadMiddleware
};

