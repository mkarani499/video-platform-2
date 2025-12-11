const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',  // Local development
    'https://your-netlify-site.netlify.app'  // Your future frontend URL
  ],
  credentials: true
}));

// Database Connection - SIMPLIFIED VERSION
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/videoplatform')
.then(() => console.log('✅ MongoDB Connected Successfully!'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Define a simple User Schema (we'll expand this later)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: '🎉 Video Platform API is running!',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    endpoints: [
      '/api/test',
      '/api/users/register',
      '/api/users/login'
    ]
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend is working perfectly!',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// User Registration Route
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create new user (in production, hash password!)
    const user = new User({ name, email, password });
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'User registered successfully',
      userId: user._id 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this to your server.js:
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {  // Add '0.0.0.0'
  console.log(`🚀 Server running on port ${PORT}`);
});