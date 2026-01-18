const express = require("express");
const wishlistController = require("../controller/wishlist.controller");
const router = express.Router();
const protectRoute = require('../middleware/auth.middleware');



router.post('/', protectRoute(['user']), wishlistController.addToWishlist);
router.get('/', protectRoute(['user']), wishlistController.getWishlist);
router.delete('/delete/:id', protectRoute(['user']), wishlistController.removeWishlistItem);
router.delete('/clear', protectRoute(['user']), wishlistController.clearAllWishlist);
router.patch('/:id/move-to-cart', protectRoute(['user']), wishlistController.moveToCart);
router.patch('/:id/move-to-group', protectRoute(['user']), wishlistController.moveToGroup);
router.patch('/:id/mask-as-purchased', protectRoute(['user']), wishlistController.markAsPurchased);

// Wishlist groups
router.get('/groups', protectRoute(['user']), wishlistController.getGroups);
router.post('/groups/create', protectRoute(['user']), wishlistController.createGroup);
router.post('/share/:groupId', protectRoute(['user']), wishlistController.shareWishlistGroup);
router.get('/shared/:groupId', wishlistController.getSharedWishlistGroup);
router.delete('/groups/delete/:groupId', protectRoute(['user']), wishlistController.deleteGroup);

module.exports = router;