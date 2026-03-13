const express = require('express');
const router = express.Router();
const { uploadVideo, uploadThumbnail } = require('../config/cloudinary');
const Video = require('../models/Video');
const auth = require('../middleware/auth');

// Upload video only (single file)
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

// Upload video with thumbnail - FIXED VERSION using fields()
router.post('/video-with-thumbnail', auth, 
  uploadVideo.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      console.log('🔍 Upload debug:');
      console.log('Files received:', req.files);
      
      // Get files from req.files object
      const videoFile = req.files?.['video']?.[0];
      const thumbnailFile = req.files?.['thumbnail']?.[0];
      
      console.log('Video file:', videoFile ? '✅ Received' : '❌ Missing');
      console.log('Thumbnail file:', thumbnailFile ? '✅ Received' : '❌ Missing');
      console.log('Body fields:', req.body);
      
      if (!videoFile) {
        return res.status(400).json({ error: 'No video file uploaded' });
      }

      // Create video record in database
      const video = new Video({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price || 50,
        url: videoFile.path,
        thumbnail: thumbnailFile?.path || '',
        duration: videoFile.duration || 0,
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

    if (result.result === 'ok') {
      // Also delete from database
      await Video.findOneAndDelete({ url: { $regex: publicId } });
    }

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