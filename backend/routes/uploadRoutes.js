const express = require('express');
const router = express.Router();
const { uploadVideo, uploadThumbnail } = require('../config/cloudinary');
const Video = require('../models/Video');
const auth = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

// Simple video only upload
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
        publicId: req.file.filename
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to get video duration from Cloudinary
async function getVideoDuration(publicId) {
  try {
    // Get video details from Cloudinary using the public ID
    const result = await cloudinary.api.resource(publicId, {
      resource_type: 'video'
    });
    return result.duration || 0;
  } catch (error) {
    console.error('Error fetching video duration:', error);
    return 0;
  }
}

// Video with optional thumbnail - WITH DURATION FIX
router.post('/video-with-thumbnail', auth, 
  uploadVideo.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      console.log('📹 Upload request received');
      console.log('Files:', req.files);
      console.log('Body:', req.body);

      const videoFile = req.files?.video?.[0];
      const thumbnailFile = req.files?.thumbnail?.[0];

      if (!videoFile) {
        return res.status(400).json({ error: 'No video file uploaded' });
      }

      // Extract public ID from Cloudinary URL
      // Cloudinary URL format: https://res.cloudinary.com/cloud_name/video/upload/v1234567/folder/public_id.mp4
      let publicId = null;
      let duration = 0;

      if (videoFile.path) {
        // Method 1: Try to get from upload response first
        if (videoFile.duration) {
          duration = videoFile.duration;
          console.log('✅ Duration from upload:', duration);
        } else {
          // Method 2: Extract public ID from URL
          const urlParts = videoFile.path.split('/');
          const filenameWithExt = urlParts[urlParts.length - 1];
          publicId = filenameWithExt.split('.')[0]; // Remove extension
          
          // If nested in folders, get the full path
          const uploadIndex = urlParts.indexOf('upload');
          if (uploadIndex !== -1 && urlParts.length > uploadIndex + 2) {
            // Get everything after upload/video-version/
            publicId = urlParts.slice(uploadIndex + 2).join('/').split('.')[0];
          }
          
          console.log('🔍 Extracted publicId:', publicId);
          
          // Method 3: Fetch duration from Cloudinary API
          if (publicId) {
            duration = await getVideoDuration(publicId);
            console.log('✅ Duration from API:', duration);
          }
        }
      }

      // Create video record in database
      const video = new Video({
        title: req.body.title || 'Untitled',
        description: req.body.description || '',
        price: Number(req.body.price) || 50,
        url: videoFile.path,
        thumbnail: thumbnailFile?.path || '',
        duration: duration, // Now we have the actual duration!
        uploader: req.userId,
        isPublic: req.body.isPublic === 'true'
      });

      await video.save();
      console.log('✅ Video saved to database with duration:', duration);

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
      console.error('❌ Upload error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete video from Cloudinary
router.delete('/video/:publicId', auth, async (req, res) => {
  try {
    const { publicId } = req.params;
    
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

// Get video details by ID
router.get('/:videoId', async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId)
      .populate('uploader', 'name email');
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({
      success: true,
      video: {
        id: video._id,
        title: video.title,
        description: video.description,
        url: video.url,
        thumbnail: video.thumbnail,
        duration: video.duration,
        price: video.price,
        uploader: video.uploader,
        createdAt: video.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;