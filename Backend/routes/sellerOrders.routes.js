const express = require('express');
const router = express.Router();
const sellerOrderController = require('../controller/sellerOrder.controller');
const protectRoute = require('../middleware/auth.middleware');

// All routes require seller authentication
router.get('/', protectRoute(['seller']), sellerOrderController.getSellerOrders);
router.get('/dashboard', protectRoute(['seller']), sellerOrderController.getSellerDashboard);
router.get('/:id', protectRoute(['seller']), sellerOrderController.getSellerOrderById);

module.exports = router;
