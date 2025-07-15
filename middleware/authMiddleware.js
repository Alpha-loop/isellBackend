// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User'); // To find the user if needed, and ensure they exist
const dotenv = require('dotenv');

dotenv.config(); // Ensure JWT_SECRET is loaded from .env

const protect = async (req, res, next) => {
  let token;

  // 1. Check if token exists in headers
  // Tokens are usually sent in the format: "Bearer <TOKEN>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (remove "Bearer " prefix)
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Attach user to the request object (without password)
      // We find the user by ID from the token payload and attach it to req.user
      req.user = await User.findById(decoded.id).select('-password');

      // 4. Continue to the next middleware/route handler
      next();

    } catch (error) {
      console.error('Token verification error:', error);
      // If token is invalid or expired
      return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  }

  // If no token is provided
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token.' });
  }
};

module.exports = { protect };