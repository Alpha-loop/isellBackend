const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // You'll need this for JWTs
const dotenv = require('dotenv');

dotenv.config(); // Make sure your environment variables are loaded

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password.' });
    }

    // 2. Check if user exists
    // IMPORTANT: use .select('+password') to retrieve the password hash
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET, // Make sure you have JWT_SECRET in your .env
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // 5. Send success response with token
    res.status(200).json({
      message: 'Login successful!',
      token,
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email }
    });

  } catch (error) {
    console.error('Server login error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};