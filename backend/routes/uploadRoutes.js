const express = require('express');
const router = express.Router();
const { uploadVideo, uploadThumbnail } = require('../config/cloudinary');
const Video = require('../models/Video');
const auth = require('../middleware/auth');

// Upload video only
router.post('/video', auth, uploadVideo.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    res.json({
      success: true,
      message: 'Video uploaded successfully',
      video: {
        url: req.file.path,
        publicId: req.file.filename,
        format: req.file.format,
        duration: req.file.duration,
        size: req.file.bytes
      }
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload video with thumbnail - FIXED VERSION
router.post('/video-with-thumbnail', auth, 
  uploadVideo.single('video'),
  uploadThumbnail.single('thumbnail'),
  async (req, res) => {
    try {
      console.log('🔍 Upload debug:');
      console.log('Video file:', req.file ? '✅ Received' : '❌ Missing');
      console.log('Thumbnail file:', req.files ? '✅ Received' : '❌ Missing');
      
      if (!req.file) {
        return res.status(400).json({ error: 'No video file uploaded' });
      }

      // Get thumbnail path - FIX: Using req.files[0] since we're using .single()
      const thumbnailFile = req.files?.thumbnail?.[0]; // This might be undefined
      // Better approach: Since we're using .single(), thumbnail should be in req.file for the second middleware
      // But multer handles multiple single uploads differently
      
      // Let's check both possibilities
      let thumbnailPath = '';
      
      // If we have req.files.thumbnail (array)
      if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
        thumbnailPath = req.files.thumbnail[0].path;
      }
      // If thumbnail is in req.file (from second middleware)
      else if (req.file && req.file.fieldname === 'thumbnail') {
        thumbnailPath = req.file.path;
      }
      
      console.log('Thumbnail path:', thumbnailPath || 'None');

      // Create video record in database
      const video = new Video({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price || 50,
        url: req.file.path,
        thumbnail: thumbnailPath,
        duration: req.file.duration || 0,
        uploader: req.userId,
        isPublic: req.body.isPublic === 'true'
      });

      await video.save();

      res.json({
        success: true,
        message: 'Video uploaded and saved successfully',
        video: {
          id: video._id,
          title: video.title,
          url: video.url,
          thumbnail: video.thumbnail,
          duration: video.duration
        }
      });
    } catch (error) {
      console.error('❌ Video upload error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete video from Cloudinary
router.delete('/video/:publicId', auth, async (req, res) => {
  try {
    const { publicId } = req.params;
    const cloudinary = require('../config/cloudinary').cloudinary;

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'video'
    });

    res.json({
      success: true,
      message: 'Video deleted successfully',
      result
    });
  } catch (error) {
    console.error('Video deletion error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;