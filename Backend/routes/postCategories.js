const express = require('express');
const router = express.Router();
const postCategoryController = require('../controller/postCategory.controller');
const protectRoute = require('../middleware/auth.middleware');

// Protect all routes with admin role
router.use(protectRoute(['admin']));

// GET /api/post-categories - List with filters/pagination
router.get('/', postCategoryController.getPostCategories);

// GET /api/post-categories/:id - Detail
router.get('/:id', postCategoryController.getPostCategoryDetail);

// POST /api/post-categories - Create new category
router.post('/', postCategoryController.createPostCategory);

// PUT /api/post-categories/:id - Update category
router.put('/:id', postCategoryController.updatePostCategory);

// DELETE /api/post-categories/:id - Delete category
router.delete('/:id', postCategoryController.deletePostCategory);

module.exports = router;
