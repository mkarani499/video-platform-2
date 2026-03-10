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

// Upload video with thumbnail
router.post('/video-with-thumbnail', auth, 
  uploadVideo.single('video'),
  uploadThumbnail.single('thumbnail'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No video file uploaded' });
      }

      // Create video record in database
      const video = new Video({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price || 50,
        url: req.file.path,
        thumbnail: req.files?.thumbnail?.[0]?.path || '',
        duration: req.file.duration,
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
      console.error('Video upload error:', error);
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