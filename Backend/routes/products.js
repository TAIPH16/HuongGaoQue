const express = require('express');
const router = express.Router();
const productController = require('../controller/product.controller');
const protectRoute = require('../middleware/auth.middleware');


// Protect all routes with admin role
router.use(protectRoute(['admin']));

// GET /api/products - List with filters/pagination
router.get('/', productController.getProducts);

// GET /api/products/stats/revenue - Revenue statistics
router.get('/stats/revenue', productController.getRevenueStats);

// GET /api/products/:id - Detail
router.get('/:id', productController.getProductDetail);

// POST /api/products - Create new product
router.post('/', productController.uploadMiddleware, productController.createProduct);

// PUT /api/products/:id - Update product
router.put('/:id', productController.uploadMiddleware, productController.updateProduct);

// DELETE /api/products/:id - Delete product
router.delete('/:id', productController.deleteProduct);

// PUT /api/products/:id/approve - Approve product
router.put('/:id/approve', productController.approveProduct);

// PUT /api/products/:id/reject - Reject product
router.put('/:id/reject', productController.rejectProduct);

module.exports = router;
