const express = require('express');
const router = express.Router();
const { uploadVideo, uploadThumbnail } = require('../config/cloudinary');
const Video = require('../models/Video');
const auth = require('../middleware/auth');

// Upload video with thumbnail - FIXED (using fields instead of multiple .single)
router.post('/video-with-thumbnail', auth, 
  uploadVideo.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      console.log('📥 Upload received');
      console.log('Files object:', req.files);
      
      const videoFile = req.files?.video?.[0];
      const thumbnailFile = req.files?.thumbnail?.[0];
      
      console.log('Video file:', videoFile ? '✅' : '❌');
      console.log('Thumbnail file:', thumbnailFile ? '✅' : '❌');
      
      if (!videoFile) {
        return res.status(400).json({ error: 'No video file uploaded' });
      }

      const video = new Video({
        title: req.body.title,
        description: req.body.description,
        price: Number(req.body.price) || 50,
        url: videoFile.path,
        thumbnail: thumbnailFile?.path || '',
        duration: videoFile.duration || 0,
        uploader: req.userId,
        isPublic: true
      });

      await video.save();
      
      console.log('✅ Video saved:', video._id);
      
      res.json({
        success: true,
        message: 'Video uploaded successfully!',
        video: { 
          id: video._id, 
          title: video.title, 
          url: video.url, 
          thumbnail: video.thumbnail,
          duration: video.duration
        }
      });
    } catch (error) {
      console.error('❌ Upload error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
  res.json({ message: 'Upload route is working!' });
});

module.exports = router;