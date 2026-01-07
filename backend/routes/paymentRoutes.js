const express = require('express');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Payment routes working!' });
});

// Initiate payment
router.post('/initiate', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Payment simulated successfully',
    paymentId: 'test-' + Date.now(),
    mpesaReceipt: 'TEST' + Date.now().toString().slice(-6)
  });
});

// Check payment status
router.get('/status/:paymentId', (req, res) => {
  res.json({
    status: 'success',
    mpesaReceipt: 'TEST' + req.params.paymentId.slice(-6),
    amount: 50,
    createdAt: new Date().toISOString()
  });
});

module.exports = router;