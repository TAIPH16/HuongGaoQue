const express = require('express');
const router = express.Router();
const orderController = require('../controller/order.controller');
const protectRoute = require('../middleware/auth.middleware');

// Protect all routes with 'user' role (customers)
router.use(protectRoute(['user']));

// POST /api/customer/orders - Create new order by customer
router.post('/', orderController.createCustomerOrder);

// GET /api/customer/orders - Get orders for the authenticated customer
router.get('/', orderController.getCustomerOrders);

// GET /api/customer/orders/:id - Get detail of a specific order for the authenticated customer
router.get('/:id', orderController.getCustomerOrderDetail);

// PUT /api/customer/orders/:id - Customer status update (Cancel, Paid, Complete)
router.put('/:id', orderController.updateCustomerOrder);

module.exports = router;

