//Vo Lam Thuy Vi
const express = require('express');
const router = express.Router();
const cartController = require('../controller/cart.controller');
const protectRoute = require('../middleware/auth.middleware');

//Router
router.post('/add', protectRoute(['user']), cartController.addToCart);
router.get('/', protectRoute(['user']), cartController.getCartsByUser);
router.put('/:itemId', protectRoute(['user']), cartController.editCartItemQuantity);
router.delete('/', protectRoute(['user']), cartController.removeItem);
router.delete('/clear', protectRoute(['user']), cartController.clearAllCart)
module.exports = router;