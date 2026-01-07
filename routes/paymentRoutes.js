const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Video = require('../models/Video');
const auth = require('../middleware/auth');

// Simple payment initiation (without M-Pesa for now)
router.post('/initiate', auth, async (req, res) => {
  try {
    const { phone, amount, videoId } = req.body;
    const userId = req.userId;

    // Validate video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Create payment record
    const payment = new Payment({
      user: userId,
      video: videoId,
      amount,
      phone,
      status: 'success', // For testing, always succeed
      mpesaReceipt: 'TEST' + Date.now().toString().slice(-6)
    });
    await payment.save();

    res.json({
      success: true,
      message: 'Payment successful! Video unlocked.',
      paymentId: payment._id,
      mpesaReceipt: payment.mpesaReceipt
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ error: error.message || 'Payment initiation failed' });
  }
});

// Check payment status
router.get('/status/:paymentId', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json({
      status: payment.status,
      mpesaReceipt: payment.mpesaReceipt,
      amount: payment.amount,
      createdAt: payment.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// M-Pesa callback endpoint (placeholder for now)
router.post('/callback', async (req, res) => {
  console.log('M-Pesa callback received:', req.body);
  res.json({
    ResultCode: 0,
    ResultDesc: "Success"
  });
});

module.exports = router;