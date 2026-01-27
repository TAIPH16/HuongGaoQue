const express = require('express');
const router = express.Router();
const productController = require('../controller/product.controller');
const postController = require('../controller/post.controller');
const reviewController = require('../controller/review.controller');
const categoryController = require('../controller/category.controller');


// Public routes - không cần authentication

// GET /api/public/products - List products (public)
router.get('/products', productController.getProducts);

// GET /api/public/products/:id - Product detail (public)
router.get('/products/:id', productController.getProductDetail);

// GET /api/public/posts - List posts (public)
router.get('/posts', postController.getPosts);

// GET /api/public/posts/:id - Post detail (public)
router.get('/posts/:id', postController.getPostDetail);

// GET /api/public/reviews - List reviews (public)
router.get('/reviews', reviewController.listReviews);

// GET /api/public/categories - List categories (public)
router.get('/categories', categoryController.getCategories);


module.exports = router;

