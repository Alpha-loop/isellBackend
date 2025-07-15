// models/Shipment.js

const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  // Link to the User who owns this shipment
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Refers to the 'User' model
    required: true,
  },
  trackId: {
    type: String,
    required: [true, 'Track ID is required.'],
    unique: true,
    trim: true,
  },
  productName: {
    type: String,
    required: [true, 'Product name is required.'],
    trim: true,
  },
  source: {
    type: String,
    required: [true, 'Source location is required.'],
    trim: true,
  },
  destination: {
    type: String,
    required: [true, 'Destination location is required.'],
    trim: true,
  },
  expectedDate: {
    type: Date, // Storing as a Date object
    required: [true, 'Expected date is required.'],
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'In Transit', 'Delivered', 'Cancelled'], // Define possible statuses
    default: 'Pending',
    required: true,
  },
  type: {
    type: String,
    enum: ['Export', 'Import'], // To distinguish between exports and imports
    required: [true, 'Shipment type (Export/Import) is required.'],
  },
  // You might add more fields as needed, e.g.,
  // weight: { type: Number },
  // dimensions: { length: Number, width: Number, height: Number },
  // cost: { type: Number },
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

const Shipment = mongoose.model('Shipment', shipmentSchema);

module.exports = Shipment;