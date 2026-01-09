const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/auth');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes and models
const paymentRoutes = require('./routes/paymentRoutes');
const Video = require('./models/Video');
const User = require('./models/User');

const app = express();

// ✅ CORS Configuration - UPDATED WITH YOUR VERCEL URL
const allowedOrigins = [
  'http://localhost:3000',  // Local development
  'https://video-platform-frontend-kohl.vercel.app',  // Your EXACT Vercel URL
  'https://video-platform-frontend-kohl.vercel.app/'  // With trailing slash too
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Otherwise, block the request
    const msg = 'CORS policy: This site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true
}));

app.use(express.json());
app.use('/api/auth', authRoutes);

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/videoplatform')
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: '🎉 Video Platform API is running!',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    endpoints: [
      '/api/test',
      '/api/users/register',
      '/api/users/login',
      '/api/videos',
      '/api/payments/initiate'
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

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime()
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

// Sample video creation route (for testing)
app.post('/api/videos/create-sample', async (req, res) => {
  try {
    const video = new Video({
      title: 'Sample Tutorial Video',
      description: 'Learn how to integrate M-Pesa payments',
      price: 50,
      url: 'https://example.com/sample-video.mp4',
      thumbnail: 'https://example.com/thumbnail.jpg',
      duration: 300,
      isPublic: true
    });
    
    await video.save();
    res.json({ 
      success: true, 
      message: 'Sample video created',
      video: {
        id: video._id,
        title: video.title,
        price: video.price
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all videos
app.get('/api/videos', async (req, res) => {
  try {
    const videos = await Video.find({ isPublic: true });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Use payment routes
app.use('/api/payments', authMiddleware, paymentRoutes);

// Start server - IMPORTANT FOR RENDER
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}`);
  console.log(`🌍 CORS Allowed: ${allowedOrigins.join(', ')}`);
  console.log(`💰 M-Pesa Integration: ${process.env.MPESA_CONSUMER_KEY ? 'Ready' : 'Not configured'}`);
});