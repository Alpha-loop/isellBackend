// routes/auth.js

const express = require('express');
const router = express.Router();
// Import the controller
const userController = require('../controllers/userController');

// Use the function from the controller
// Note: It's userController.registerUser, not just userController
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

module.exports = router;