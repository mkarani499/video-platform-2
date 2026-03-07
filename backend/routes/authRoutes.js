const express = require('express');
const router = express.Router();
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs'); // Add this import

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const user = new User({ name, email, password, phone });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user - UPDATED VERSION
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔍 Login attempt for:', email);

    // Find user WITHOUT using lean() to ensure methods are attached
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ User found:', user.email);
    console.log('User constructor:', user.constructor.name);
    console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(user)));
    console.log('comparePassword exists:', typeof user.comparePassword);
    
    // Check if comparePassword exists
    if (typeof user.comparePassword !== 'function') {
      console.log('⚠️ comparePassword not found, using direct bcrypt');
      
      // Try direct bcrypt
      const isValid = await bcrypt.compare(password, user.password);
      console.log('Direct bcrypt result:', isValid);
      
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Generate token
      const token = generateToken(user._id);
      console.log('✅ Login successful via direct bcrypt');
      
      return res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone
        },
        token
      });
    }

    // Use the schema method
    console.log('Using comparePassword method');
    const isValid = await user.comparePassword(password);
    console.log('Compare result:', isValid);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);
    console.log('✅ Login successful');

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      },
      token
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/me', auth, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'phone', 'email'];
    allowedUpdates.forEach(update => {
      if (updates[update] !== undefined) {
        user[update] = updates[update];
      }
    });

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;