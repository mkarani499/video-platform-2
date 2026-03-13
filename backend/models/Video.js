const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true, default: 50 },
  url: { type: String, required: true },  // Added required: true
  thumbnail: String,
  duration: { type: Number, default: 0 }, // Added default: 0
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Added uploader field
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Video', videoSchema);