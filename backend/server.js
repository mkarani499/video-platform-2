const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/auth');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes and models
const paymentRoutes = require('./routes/paymentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const Video = require('./models/Video');
const User = require('./models/User');

const app = express();

// ✅ CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://video-platform-frontend-kohl.vercel.app',
  'https://video-platform-frontend-kohl.vercel.app/'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    const msg = 'CORS policy: This site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true
}));

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

// Database Connection - UPDATED WITH TIMEOUT OPTIONS
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/videoplatform', {
  serverSelectionTimeoutMS: 30000,  // 30 seconds instead of 10
  connectTimeoutMS: 30000
})
.then(() => console.log('✅ MongoDB Connected Successfully!'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Force load models after MongoDB connection
mongoose.connection.once('open', () => {
  console.log('✅ MongoDB Connected Successfully! (Event confirmed)');
  
  require('./models/User');
  require('./models/Video');
  require('./models/Payment');
  
  console.log('📦 Models loaded');
});

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
      '/api/payments/initiate',
      '/api/upload'
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

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
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

app.get('/api/videos', async (req, res) => {
  try {
    const videos = await Video.find({ isPublic: true });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/payments', authMiddleware, paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}`);
  console.log(`🌍 CORS Allowed: ${allowedOrigins.join(', ')}`);
  console.log(`💰 M-Pesa Integration: ${process.env.MPESA_CONSUMER_KEY ? 'Ready' : 'Not configured'}`);
});