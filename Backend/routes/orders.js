const express = require('express');
const router = express.Router();
const orderController = require('../controller/order.controller');
const protectRoute = require('../middleware/auth.middleware');

// Protect all routes with admin role
router.use(protectRoute(['admin']));

// GET /api/orders - List with filters/pagination
router.get('/', orderController.getOrders);

// GET /api/orders/stats - Statistics
router.get('/stats', orderController.getOrderStats);

// GET /api/orders/:id - Detail
router.get('/:id', orderController.getOrderDetail);

// POST /api/orders - Create new order
router.post('/', orderController.createOrder);

// PUT /api/orders/:id - Update order
router.put('/:id', orderController.updateOrder);

// DELETE /api/orders/:id - Delete order
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
