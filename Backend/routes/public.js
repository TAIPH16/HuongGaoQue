const express = require('express');
const router = express.Router();
const productController = require('../controller/product.controller');
const postController = require('../controller/post.controller');
const reviewController = require('../controller/review.controller');
const categoryController = require('../controller/category.controller');


// Public routes - không cần authentication

// GET /api/public/products - List products (public)
router.get('/products', (req, res, next) => {
    req.query.isPublic = true;
    next();
}, productController.getProducts);

// GET /api/public/products/top-selling - Top sản phẩm bán chạy nhất (public)
// Phải đặt TRƯỚC /:id để tránh conflict routing
router.get('/products/top-selling', productController.getTopSellingProducts);

// GET /api/public/products/:id - Product detail (public)
router.get('/products/:id', productController.getProductDetail);
// POST /api/public/products/:id/increment-view - Tăng lượt xem sản phẩm (public)
router.post('/products/:id/increment-view', productController.incrementView);

// GET /api/public/posts - List posts (public)
router.get('/posts', postController.getPosts);
// GET /api/public/posts/featured - Bài viết nổi bật (nhiều lượt xem nhất)
router.get('/posts/featured', postController.getFeaturedPosts);

// GET /api/public/posts/:id - Post detail (public)
router.get('/posts/:id', postController.getPostDetail);
// POST /api/public/posts/:id/increment-view - Tăng lượt xem (public, để ghi log hành vi xem bài)
router.post('/posts/:id/increment-view', postController.incrementView);

// GET /api/public/reviews - List reviews (public)
router.get('/reviews', reviewController.listReviews);

// GET /api/public/categories - List categories (public)
router.get('/categories', categoryController.getCategories);


module.exports = router;

