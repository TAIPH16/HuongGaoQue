const express = require('express');
const router = express.Router();
const sellerStockController = require('../controller/sellerStock.controller');
const protectRoute = require('../middleware/auth.middleware');

// Tất cả routes cần seller authentication
router.get('/', protectRoute(['seller']), sellerStockController.getStockList);
router.get('/:id', protectRoute(['seller']), sellerStockController.getStockDetail);
router.get('/:id/history', protectRoute(['seller']), sellerStockController.getStockHistory);
router.patch('/:id', protectRoute(['seller']), sellerStockController.updateStock);
router.post('/:id/add', protectRoute(['seller']), sellerStockController.addStock);

module.exports = router;

