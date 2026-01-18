const express = require('express');
const router = express.Router();
const protectRoute = require('../middleware/auth.middleware');
const notificationController = require('../controller/notification.controller');

// =============================================================================
// AUTHENTICATED ROUTES - Admin/User
// =============================================================================

// 81. View notification list - Admin only (for management dashboard)
router.get('/', protectRoute(['admin']), notificationController.listNotifications);

// 81b. View notifications for homepage - User context
router.get('/homepage', protectRoute(['admin', 'user']), notificationController.getHomepageNotifications);

// 85. Search notification - Admin/User
router.get('/search', protectRoute(['admin', 'user']), notificationController.searchNotifications);

// Get unread count - PHẢI ĐẶT TRƯỚC /:id để tránh match nhầm
router.get('/unread-count', protectRoute(['admin', 'user']), notificationController.getUnreadCount);

// 86. Filter notification - Admin/User
// (Filter được tích hợp trong GET / - listNotifications)

// 82. View notification detail - Admin/User
// PHẢI ĐẶT SAU các route cụ thể như /unread-count, /homepage, /search
router.get('/:id', protectRoute(['admin', 'user']), notificationController.getNotification);


// 80. Create notification - Admin only
router.post('/', protectRoute(['admin']), notificationController.createNotification);

// 83. Edit notification - Admin only
router.put('/:id', protectRoute(['admin']), notificationController.updateNotification);

// 84. Delete notification - Admin only
router.delete('/:id', protectRoute(['admin']), notificationController.deleteNotification);

// Mark all as read - PHẢI ĐẶT TRƯỚC /:id/mark-read để tránh match nhầm
router.post('/mark-all-read', protectRoute(['admin', 'user']), notificationController.markAllAsRead);

// Read/Unread
router.post('/:id/mark-read', protectRoute(['admin', 'user']), notificationController.markAsRead);
router.post('/:id/mark-unread', protectRoute(['admin', 'user']), notificationController.markAsUnread);

module.exports = router;