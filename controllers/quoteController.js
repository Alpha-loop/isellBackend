const Quote = require('../models/Quote');

// Mock distance calculation (replace with real geocoding API if needed)
const calculateDistance = (origin, destination) => {
  // For demo, return a random distance between 100 and 1000 km
  return Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
};

exports.createQuote = async (req, res) => {
  const { origin, destination, weight, dimensions } = req.body;

  // Validation
  if (!origin || !destination || !weight || !dimensions) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (isNaN(weight) || weight <= 0) {
    return res.status(400).json({ error: 'Invalid weight' });
  }

  try {
    // Calculate quote: NGN 5000 base + NGN 2000 per kg + NGN 100 per km
    const distance = calculateDistance(origin, destination);
    const quoteAmount = 5000 + (weight * 2000) + (distance * 100);

    // Save to MongoDB
    const quote = new Quote({
      origin,
      destination,
      weight,
      dimensions,
      quote: quoteAmount,
      currency: 'NGN',
      distance,
    });
    await quote.save();

    res.status(201).json({
      origin,
      destination,
      quote: quoteAmount.toFixed(2),
      currency: quote.currency,
      estimatedDelivery: '3-5 business days',
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};