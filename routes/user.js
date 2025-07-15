// routes/user.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware

// Example protected route to get user profile (for dashboard "Hello, Sam")
router.get('/profile', protect, userController.getUserProfile);

router.get('/dashboard', protect, userController.getDashboardData);

router.get('/recent-shipments', protect, userController.getShipments);

router.get('/shipments', protect, userController.getShipments);

router.post('/shipments', protect, userController.createShipment);

router.get('/shipments/:id', protect, userController.getShipmentDetails);

router.put('/shipments/:id/status', protect, userController.updateShipmentStatus);

module.exports = router;