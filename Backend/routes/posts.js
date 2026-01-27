const express = require('express');
const router = express.Router();
const postController = require('../controller/post.controller');
const protectRoute = require('../middleware/auth.middleware');

// Protect all routes with admin role
router.use(protectRoute(['admin']));

// GET /api/posts - List with filters/pagination
router.get('/', postController.getPosts);

// GET /api/posts/:id - Detail
router.get('/:id', postController.getPostDetail);

// POST /api/posts - Create new post
router.post('/', postController.uploadMiddleware, postController.createPost);

// PUT /api/posts/:id - Update post
router.put('/:id', postController.uploadMiddleware, postController.updatePost);

// DELETE /api/posts/:id - Delete post
router.delete('/:id', postController.deletePost);

// POST /api/posts/:id/increment-view - Increment view count
router.post('/:id/increment-view', postController.incrementView);

module.exports = router;
