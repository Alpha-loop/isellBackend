const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Your authentication middleware
const notificationController = require('../controllers/notificationController'); // Adjust path as needed

// Get all notifications for the authenticated user
router.get('/', protect, notificationController.getNotifications);

// Mark a specific notification as read
router.put('/:id/read', protect, notificationController.markNotificationAsRead);

// Mark all notifications for the user as read
router.put('/mark-all-read', protect, notificationController.markAllNotificationsAsRead);

// Delete a specific notification
router.delete('/:id', protect, notificationController.deleteNotification);


module.exports = router;