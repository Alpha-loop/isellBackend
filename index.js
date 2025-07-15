const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const quoteRoutes = require('./routes/quote');
const authRoutes = require('./routes/auth');
const { protect } = require('./middleware/authMiddleware');
const userRoutes = require('./routes/user');
const notificationRoutes = require('./routes/notification');

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
const allowedOrigins = [
  'https://app.iselllogistics.com',
  'http://localhost:3000',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
}));

app.options('*', cors());

// Routes
app.use('/api', quoteRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', protect, userRoutes);
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// index.js

// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const connectDB = require('./config/db');
// const quoteRoutes = require('./routes/quote');
// const authRoutes = require('./routes/auth');
// const { protect } = require('./middleware/authMiddleware');
// const userRoutes = require('./routes/user');

// dotenv.config();
// const app = express();

// app.use(express.json()); // Correctly placed for body parsing

// // Connect to MongoDB
// connectDB();

// // CORS Middleware (your existing setup is fine)
// const allowedOrigins = [
//   'https://app.iselllogistics.com',
//   'http://localhost:3000',
// ];
// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'], // <--- Ensure 'Authorization' is allowed
//   credentials: true,
//   optionsSuccessStatus: 200,
// }));

// app.options('*', cors());

// // Routes
// // Public Routes (no authentication needed)
// app.use('/api/auth', authRoutes); // Login and Register
// app.use('/api/users', protect, userRoutes);

// // Protected Routes (authentication required)
// // Example: If you have a user profile route that needs protection
// // app.use('/api/users/profile', protect, userRoutes); // Example of a protected user route

// // For your dashboard, you'll create a new route, e.g., '/api/dashboard'
// // For now, let's just make a simple test route to ensure middleware works:
// app.get('/api/test-protected', protect, (req, res) => {
//   res.status(200).json({
//     message: 'You accessed a protected route!',
//     user: req.user // This will show the user data attached by the middleware
//   });
// });


// // Add your other routes if they are protected
// app.use('/api', quoteRoutes); // If quoteRoutes contains protected routes, you'd apply 'protect' here too or on individual routes within quoteRoutes

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });