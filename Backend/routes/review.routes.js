const express = require('express');
const router = express.Router();
const protectRoute = require('../middleware/auth.middleware');
const reviewController = require('../controller/review.controller');

// =============================================================================
// PUBLIC ROUTES - Tất cả role (Admin/User/Guest)
// =============================================================================

// 67. View review list - Admin, User, Guest
router.get('/', reviewController.listReviews);

// Protected list for dashboard (ensures role is read from token)
router.get('/manage', protectRoute(["admin"]), reviewController.listReviews);

// 71. Search review - Admin, User, Guest  
router.get('/search', reviewController.searchReviews);

// Protected search for dashboard
router.get('/manage/search', protectRoute(["admin"]), reviewController.searchReviews);

// 68. View review detail - Admin, User, Guest
router.get('/:id', reviewController.getReview);

// 72. Filter review - Admin, User, Guest
// (Filter được tích hợp trong GET / - listReviews)

// =============================================================================
// AUTHENTICATED ROUTES
// =============================================================================

// 66. Create product reviews - Admin, User
router.post('/', protectRoute(["user", "admin"]), reviewController.createReview);

// 69. Edit review - Admin, User (theo bảng ảnh)
router.put('/:id', protectRoute(["user", "admin"]), reviewController.updateReview);

// 70. Delete review - Admin, User
router.delete('/:id', protectRoute(["user", "admin"]), reviewController.deleteOrHideReview);

// Reply to Review - User/Admin can reply
router.post('/:id/replies', protectRoute(["user", "admin"]), reviewController.createReply);

// View replies - All roles (public)
router.get('/:id/replies', reviewController.listReplies);

module.exports = router;


