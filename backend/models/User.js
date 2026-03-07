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
  // Add these options to ensure methods are attached
  strict: true,
  id: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // IMPORTANT: Only hash if password is new or modified
  if (!this.isModified('password')) return next();
  
  try {
    console.log('🔐 Hashing password for:', this.email);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('✅ Password hashed successfully');
    next();
  } catch (error) {
    console.error('❌ Hashing error:', error);
    next(error);
  }
});

// Compare password method - defined BEFORE model creation
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('🔍 Comparing passwords...');
    console.log('Candidate password:', candidatePassword);
    console.log('Stored hash:', this.password);
    
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password match?', isMatch);
    return isMatch;
  } catch (error) {
    console.error('❌ Compare error:', error);
    throw error;
  }
};

// Add a test method to verify methods are working
userSchema.methods.testMethod = function() {
  console.log('✅ Methods are working!');
  return true;
};

// Create the model
const User = mongoose.model('User', userSchema);

// Log to confirm methods are attached
console.log('✅ User model loaded. Methods:', Object.keys(User.schema.methods));

module.exports = User;