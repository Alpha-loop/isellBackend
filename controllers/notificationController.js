const Notification = require('../models/Notification'); // Adjust path as needed
const asyncHandler = require('express-async-handler'); // If you're using this for error handling

// @desc    Get all notifications for the authenticated user
// @route   GET /api/notifications
// @access  Private (protect middleware)
const getNotifications = asyncHandler(async (req, res) => {
    // req.user.id is available thanks to your 'protect' middleware
    const notifications = await Notification.find({ userId: req.user.id })
                                            .sort({ createdAt: -1 }); // Get most recent first

    res.status(200).json({
        success: true,
        count: notifications.length,
        data: notifications
    });
});

// @desc    Mark a specific notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private (protect middleware)
const markNotificationAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOne({ _id: req.params.id, userId: req.user.id });

    if (!notification) {
        res.status(404);
        throw new Error('Notification not found or not authorized');
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: notification
    });
});

// @desc    Mark all notifications for the user as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private (protect middleware)
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { $set: { isRead: true } });

    res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
    });
});

// @desc    Delete a specific notification
// @route   DELETE /api/notifications/:id
// @access  Private (protect middleware)
const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!notification) {
        res.status(404);
        throw new Error('Notification not found or not authorized');
    }

    res.status(200).json({
        success: true,
        message: 'Notification deleted successfully',
    });
});

// --- Internal Helper Function to Create Notifications (not an endpoint) ---
// This function would be called by other parts of your backend logic
// e.g., when a shipment status changes, or a shipment is created/deleted.
const createNotification = async (userId, title, type, relatedEntityId = null, relatedEntityType = null) => {
    try {
        const newNotification = new Notification({
            userId,
            title,
            type,
            relatedEntityId,
            relatedEntityType,
            isRead: false // New notifications are unread by default
        });
        await newNotification.save();
        console.log(`Notification created for user ${userId}: ${title}`);
        return newNotification;
    } catch (error) {
        console.error(`Error creating notification for user ${userId}: ${error.message}`);
        // Handle error, maybe log to an error monitoring system
        throw error; // Re-throw to be handled by the caller
    }
};

module.exports = {
    createNotification,
    deleteNotification,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    getNotifications,
};