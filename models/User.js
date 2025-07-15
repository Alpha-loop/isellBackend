const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required.'],
    trim: true, // Removes whitespace from both ends
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required.'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required.'],
    unique: true, // Ensures no two users can register with the same email
    lowercase: true, // Converts email to lowercase before saving
    // validate: [validator.isEmail, 'Please provide a valid email address.'],
  },
  password: {
    type: String,
    required: [true, 'Password is required.'],
    minlength: [8, 'Password must be at least 8 characters long.'],
    select: false, // Prevents password from being sent back in API responses by default
  },
}, {
  // Adds createdAt and updatedAt timestamps automatically
  timestamps: true
});

// --- Mongoose Middleware (Hook) to Hash Password ---
// This function runs automatically *before* a new user document is saved.
userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified (or is new)
  if (!this.isModified('password')) return next();

  // Hash the password with a cost factor of 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;