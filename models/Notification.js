const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { // To link notifications to a specific user
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model
        required: true,
    },
    title: { // The main message/title of the notification (e.g., "Your Package has been shipped")
        type: String,
        required: true,
    },
    // You might want a more detailed 'message' if 'title' is too short for some notifications
    // message: {
    //     type: String,
    //     required: false,
    // },
    type: { // Categorize notifications (e.g., 'shipment_status', 'shipment_deleted', 'system_alert')
        type: String,
        enum: ['shipment_status', 'shipment_deleted', 'quote_update', 'general'], // Examples
        default: 'general',
    },
    // Optional: link to a specific shipment or order if the notification is related
    relatedEntityId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedEntityType', // Dynamic reference based on relatedEntityType
        required: false,
    },
    relatedEntityType: { // 'Shipment', 'Quote', etc.
        type: String,
        enum: ['Shipment', 'Quote'], // Example types
        required: false,
    },
    isRead: { // To track if the user has seen/read the notification
        type: Boolean,
        default: false,
    },
    createdAt: { // Timestamp for when the notification was created
        type: Date,
        default: Date.now,
        expires: '30d' // Optional: Automatically delete notifications after 30 days to keep the database clean
    },
}, { timestamps: true }); // Mongoose adds createdAt and updatedAt automatically

module.exports = mongoose.model('Notification', notificationSchema);