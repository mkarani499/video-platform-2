const express = require('express');
const router = express.Router();
const { uploadVideo, uploadThumbnail } = require('../config/cloudinary');
const Video = require('../models/Video');
const auth = require('../middleware/auth');

// Upload video with thumbnail - SIMPLIFIED
router.post('/video-with-thumbnail', auth, 
  uploadVideo.single('video'),
  uploadThumbnail.single('thumbnail'),
  async (req, res) => {
    try {
      console.log('📥 Upload received');
      console.log('Video file:', req.file ? '✅' : '❌');
      console.log('Thumbnail file:', req.files ? '✅' : '❌');
      
      const videoFile = req.file;
      const thumbnailFile = req.files?.thumbnail?.[0];
      
      if (!videoFile) {
        return res.status(400).json({ error: 'No video file' });
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
      
      res.json({
        success: true,
        message: 'Video uploaded!',
        video: { id: video._id, title: video.title, url: video.url, thumbnail: video.thumbnail }
      });
    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;