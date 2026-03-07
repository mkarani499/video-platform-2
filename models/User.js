const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  phone: String,
  purchasedVideos: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Video' 
  }],
  createdAt: { type: Date, default: Date.now }
}, {
  // Add this to ensure methods are properly attached
  strict: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method - ENSURE THIS IS DEFINED BEFORE MODEL CREATION
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('🔍 comparePassword called'); // Debug log
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password match:', isMatch); // Debug log
    return isMatch;
  } catch (error) {
    console.error('Compare error:', error);
    throw error;
  }
};

// Add a test method to verify schema methods are working
userSchema.methods.test = function() {
  console.log('✅ Schema methods are working');
  return true;
};

// Create the model
const User = mongoose.model('User', userSchema);

// Log to confirm methods are attached
console.log('✅ User model loaded. Methods:', Object.keys(User.schema.methods));

module.exports = User;