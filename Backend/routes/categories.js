const express = require('express');
const router = express.Router();
const categoryController = require('../controller/category.controller');
const protectRoute = require('../middleware/auth.middleware');

// GET /api/categories - List with filters/pagination
router.get('/', categoryController.getCategories);

// GET /api/categories/:id - Detail
router.get('/:id', categoryController.getCategoryDetail);

// Protect write operations with admin role
router.use(protectRoute(['admin']));

// POST /api/categories - Create new category
router.post('/', categoryController.createCategory);

// PUT /api/categories/:id - Update category
router.put('/:id', categoryController.updateCategory);

// DELETE /api/categories/:id - Delete category
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
