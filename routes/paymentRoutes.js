const express = require('express');
const router = express.Router();
const mpesaService = require('../services/mpesaService');
const Payment = require('../models/Payment');
const Video = require('../models/Video');
const auth = require('../middleware/auth');

// Initiate M-Pesa payment
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
      status: 'pending'
    });
    await payment.save();

    // Initiate M-Pesa STK Push
    const mpesaResponse = await mpesaService.initiateSTKPush(
      phone,
      amount,
      `VID${videoId.slice(-6)}`, // Account reference
      `Payment for ${video.title}` // Transaction description
    );

    // Update payment with M-Pesa details
    payment.checkoutRequestID = mpesaResponse.CheckoutRequestID;
    payment.merchantRequestID = mpesaResponse.MerchantRequestID;
    await payment.save();

    res.json({
      success: true,
      message: 'Payment initiated. Please check your phone to complete payment.',
      checkoutRequestID: mpesaResponse.CheckoutRequestID,
      paymentId: payment._id
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ error: error.message || 'Payment initiation failed' });
  }
});

// M-Pesa callback endpoint
router.post('/callback', async (req, res) => {
  try {
    const callbackData = req.body;
    
    // Update payment status based on M-Pesa response
    if (callbackData.Body.stkCallback.ResultCode === 0) {
      // Payment successful
      const payment = await Payment.findOne({
        checkoutRequestID: callbackData.Body.stkCallback.CheckoutRequestID
      });
      
      if (payment) {
        payment.status = 'success';
        payment.mpesaReceipt = callbackData.Body.stkCallback.CallbackMetadata.Item.find(
          item => item.Name === 'MpesaReceiptNumber'
        ).Value;
        payment.resultCode = callbackData.Body.stkCallback.ResultCode;
        payment.resultDesc = callbackData.Body.stkCallback.ResultDesc;
        await payment.save();
        
        // Here you would grant video access to the user
        console.log(`Payment successful for user ${payment.user}`);
      }
    }
    
    // Always respond to M-Pesa
    res.json({
      ResultCode: 0,
      ResultDesc: "Success"
    });
  } catch (error) {
    console.error('Callback error:', error);
    res.json({
      ResultCode: 1,
      ResultDesc: "Failed"
    });
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

module.exports = router;