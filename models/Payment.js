const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
  amount: { type: Number, required: true },
  phone: { type: String, required: true },
  mpesaReceipt: String,
  checkoutRequestID: String,
  merchantRequestID: String,
  resultCode: Number,
  resultDesc: String,
  status: { 
    type: String, 
    enum: ['pending', 'success', 'failed', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);