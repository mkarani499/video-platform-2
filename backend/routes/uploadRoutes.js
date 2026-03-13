const express = require('express');
const router = express.Router();
const { uploadVideo } = require('../config/cloudinary');
const Video = require('../models/Video');
const auth = require('../middleware/auth');

// Upload video with optional thumbnail
router.post('/video-with-thumbnail', auth, (req, res, next) => {
  // Use fields() to handle both video and thumbnail
  const upload = uploadVideo.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]);
  
  upload(req, res, function(err) {
    if (err) {
      console.error('❌ Upload error:', err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('📥 Upload request received');
    
    const videoFile = req.files?.video?.[0];
    const thumbnailFile = req.files?.thumbnail?.[0];
    
    console.log('Video:', videoFile ? '✅' : '❌');
    console.log('Thumbnail:', thumbnailFile ? '✅' : '❌');
    
    if (!videoFile) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    // Create video record
    const video = new Video({
      title: req.body.title || 'Untitled',
      description: req.body.description || '',
      price: Number(req.body.price) || 50,
      url: videoFile.path,
      thumbnail: thumbnailFile?.path || '',
      duration: videoFile.duration || 0,
      uploader: req.userId,
      isPublic: req.body.isPublic === 'true'
    });

    await video.save();
    console.log('✅ Video saved with ID:', video._id);

    res.json({
      success: true,
      message: 'Video uploaded successfully',
      video: {
        id: video._id,
        title: video.title,
        url: video.url,
        thumbnail: video.thumbnail,
        duration: video.duration
      }
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;