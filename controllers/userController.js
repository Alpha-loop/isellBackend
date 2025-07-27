// controllers/userController.js

const User = require('../models/User');
const Shipment = require('../models/Shipment');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // You'll need this for JWTs
const dotenv = require('dotenv');

dotenv.config();

// Define the function
const registerUser = async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Please enter all required fields.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ 
      firstName, 
      lastName, 
      email, 
      password: hashedPassword,
    });
    const savedUser = await newUser.save();

    const payload = {
      user: {
        id: savedUser._id, 
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });

    res.status(201).json({
      message: 'User registered successfully!',
      user: { id: savedUser._id, firstName: savedUser.firstName, lastName: savedUser.lastName, email: savedUser.email },
      token: token
    });
  } catch (error) {
     if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(' ') });
    }
    console.error('Server registration error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

const loginUser = async (req, res) => { // <--- THIS FUNCTION MUST BE DEFINED
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter email and password.' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

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

const getUserProfile = async (req, res) => {
  try {
    // req.user is available here because of the 'protect' middleware
    // It contains the user object (without password)
    const user = req.user; // The middleware already fetched the user

    if (user) {
      res.status(200).json({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        // Add other user fields needed for dashboard header here, e.g., walletBalance
        // walletBalance: user.walletBalance || 0
      });
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error fetching user profile.' });
  }
};
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user details for name
    // Adjust .select() to only get fields you need, excluding walletBalance
    const user = await User.findById(userId).select('firstName lastName'); // Removed walletBalance
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const totalShipments = await Shipment.countDocuments({ user: userId });
    const totalExports = await Shipment.countDocuments({ user: userId, type: 'Export' });
    const totalImports = await Shipment.countDocuments({ user: userId, type: 'Import' });

    res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      // REMOVE THIS LINE if you added it:
      // walletBalance: user.walletBalance,
      totalShipments,
      totalExports,
      totalImports,
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data.' });
  }
};

const getShipments = async (req, res) => {
  try {
    const userId = req.user._id;

    // Build query object
    const query = { user: userId };

    // --- Search functionality ---
    // If a 'search' query parameter is provided, add it to the query
    // This will search in trackId and productName
    const { search, status, page = 1, limit = 10 } = req.query; // Default page 1, limit 10

    if (search) {
      // Using $or to search across multiple fields
      query.$or = [
        { trackId: { $regex: search, $options: 'i' } }, // Case-insensitive search for trackId
        { productName: { $regex: search, $options: 'i' } }, // Case-insensitive search for productName
      ];
    }

    // --- Filter by Status functionality ---
    // If a 'status' query parameter is provided, add it to the query
    if (status) {
      // Ensure the status is one of your defined enums if strict validation is needed
      // This implicitly handles invalid status values by returning no results if not found
      query.status = status;
    }

    // --- Pagination functionality ---
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Get total count for pagination metadata
    const totalCount = await Shipment.countDocuments(query);

    // Fetch shipments based on query, sort, skip, and limit
    const shipments = await Shipment.find(query)
      .sort({ createdAt: -1 }) // Still sort by newest first for default order
      .skip(skip)
      .limit(limitNumber)
      .select('trackId productName source destination expectedDate status'); // Select only required fields for the table

    res.status(200).json({
      shipments,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
      totalItems: totalCount,
    });

  } catch (error) {
    console.error('Error fetching shipments:', error);
    res.status(500).json({ message: 'Server error fetching shipments.' });
  }
};

const createShipment = async (req, res) => {
  try {
    const userId = req.user._id; // Get user ID from the middleware (the owner of the shipment)

    // Destructure required fields from the request body
    const { trackId, productName, source, destination, expectedDate, status, type } = req.body;

    // Basic validation: Check if all required fields are present
    if (!trackId || !productName || !source || !destination || !expectedDate || !status || !type) {
      return res.status(400).json({ message: 'Please enter all required shipment fields.' });
    }

    // Optional: Validate expectedDate format if needed (e.g., using a library like moment.js or a regex)
    // For now, Mongoose's Date type will attempt to parse it.

    // Optional: Check if trackId already exists (since it's unique in the model)
    const existingShipment = await Shipment.findOne({ trackId });
    if (existingShipment) {
      return res.status(400).json({ message: 'Shipment with this Track ID already exists.' });
    }

    // Create a new Shipment document
    const newShipment = new Shipment({
      user: userId, // Assign the logged-in user as the owner
      trackId,
      productName,
      source,
      destination,
      expectedDate: new Date(expectedDate), // Convert to Date object
      status,
      type,
    });

    // Save the shipment to the database
    const savedShipment = await newShipment.save();

    res.status(201).json({
      message: 'Shipment created successfully!',
      shipment: savedShipment,
    });

  } catch (error) {
    console.error('Error creating shipment:', error);
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(' ') });
    }
    // Handle duplicate key error (for trackId unique constraint)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A shipment with this Track ID already exists.' });
    }
    res.status(500).json({ message: 'Server error creating shipment. Please try again later.' });
  }
};

const getShipmentDetails = async (req, res) => {
  try {
    const shipmentId = req.params.id; // Get the shipment ID from the URL parameters
    const userId = req.user._id;     // Get the logged-in user's ID from the middleware

    // Find the shipment by its ID AND ensure it belongs to the logged-in user
    const shipment = await Shipment.findOne({ _id: shipmentId, user: userId });

    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found or you do not have permission to view it.' });
    }

    res.status(200).json(shipment);

  } catch (error) {
    console.error('Error fetching shipment details:', error);
    // Handle Mongoose CastError if an invalid ID format is provided
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid shipment ID format.' });
    }
    res.status(500).json({ message: 'Server error fetching shipment details. Please try again later.' });
  }
};

const updateShipmentStatus = async (req, res) => {
  try {
    const shipmentId = req.params.id; // Get the shipment ID from the URL parameters
    const userId = req.user._id;     // Get the logged-in user's ID from the middleware

    const { status } = req.body; // Get the new status from the request body

    // Validate the status input
    if (!status) {
      return res.status(400).json({ message: 'New status is required.' });
    }

    // Optional: You might want to define a strict order for status updates
    // For example, you can't go from 'Delivered' back to 'Pending'.
    // This logic can be more complex, but for now, we'll just check if it's a valid enum value.
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'In Transit', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status: ${status}. Must be one of ${validStatuses.join(', ')}.` });
    }

    // Find the shipment and update its status
    // We update only if the shipment belongs to the logged-in user.
    // In a real admin scenario, an admin might be able to update any shipment.
    // For now, sticking to user-owned shipments.
    const shipment = await Shipment.findOneAndUpdate(
      { _id: shipmentId, user: userId }, // Query: find by ID AND user
      { status: status, updatedAt: new Date() }, // Update: set new status and update timestamp
      { new: true, runValidators: true } // Options: return the updated document, run schema validators
    );

    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found or you do not have permission to update it.' });
    }

    res.status(200).json({
      message: 'Shipment status updated successfully!',
      shipment,
    });

  } catch (error) {
    console.error('Error updating shipment status:', error);
    // Handle Mongoose CastError for invalid ID format
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid shipment ID format.' });
    }
    res.status(500).json({ message: 'Server error updating shipment status. Please try again later.' });
  }
};

// *** THIS IS THE CRUCIAL PART ***
// Export the function so other files can use it.
module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getDashboardData,
  getShipments,
  createShipment,
  getShipmentDetails,
  updateShipmentStatus
};

