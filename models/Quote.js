const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  weight: { type: Number, required: true, min: 0 },
  dimensions: { type: String, required: true },
  quote: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  estimatedDelivery: { type: String, default: '3-5 business days' },
  distance: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Quote', quoteSchema);