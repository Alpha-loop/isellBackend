const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const quoteRoutes = require('./routes/quote');

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
const allowedOrigins = [
  'https://app.iselllogistics.com', // Your frontend production URL
  'http://localhost:3000', // For local development
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., Postman, curl) or from allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Add all needed methods
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Enable if using cookies/auth tokens
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
}));

app.options('*', cors());

// Routes
app.use('/api', quoteRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});