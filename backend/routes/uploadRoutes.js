const express = require('express');
const router = express.Router();
const { uploadVideo, uploadThumbnail } = require('../config/cloudinary');
const Video = require('../models/Video');
const auth = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

// Video with optional thumbnail - ULTRA DEBUG VERSION
router.post('/video-with-thumbnail', auth, 
  uploadVideo.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      console.log('\n========== UPLOAD DEBUG START ==========');
      console.log('1. Request received at:', new Date().toISOString());
      console.log('2. User ID:', req.userId);
      console.log('3. Body fields:', req.body);
      
      const videoFile = req.files?.video?.[0];
      const thumbnailFile = req.files?.thumbnail?.[0];

      console.log('4. Video file present:', !!videoFile);
      
      if (!videoFile) {
        return res.status(400).json({ error: 'No video file uploaded' });
      }

      // Dump the ENTIRE videoFile object
      console.log('5. COMPLETE videoFile object:');
      console.log(JSON.stringify(videoFile, null, 2));

      // Check specifically for duration in different possible locations
      console.log('6. Duration checks:');
      console.log('   - videoFile.duration:', videoFile.duration);
      console.log('   - videoFile.duration_float:', videoFile.duration_float);
      console.log('   - videoFile.metadata?.duration:', videoFile.metadata?.duration);
      console.log('   - videoFile.seconds:', videoFile.seconds);
      console.log('   - videoFile.length:', videoFile.length);

      // Cloudinary URL parsing
      console.log('7. Cloudinary URL:', videoFile.path);
      
      // Extract public ID
      let publicId = null;
      const urlParts = videoFile.path.split('/');
      const filenameWithExt = urlParts[urlParts.length - 1];
      publicId = filenameWithExt.split('.')[0];
      
      // Check if nested in folders
      const uploadIndex = urlParts.indexOf('upload');
      if (uploadIndex !== -1 && urlParts.length > uploadIndex + 2) {
        publicId = urlParts.slice(uploadIndex + 2).join('/').split('.')[0];
      }
      
      console.log('8. Extracted publicId:', publicId);

      // Try to fetch from Cloudinary API
      let duration = 0;
      if (publicId) {
        try {
          console.log('9. Fetching from Cloudinary API...');
          const result = await cloudinary.api.resource(publicId, {
            resource_type: 'video',
            image_metadata: true
          });
          console.log('10. Cloudinary API response:', JSON.stringify(result, null, 2));
          duration = result.duration || 0;
          console.log('11. Duration from API:', duration);
        } catch (apiError) {
          console.error('12. Cloudinary API error:', apiError.message);
        }
      }

      // Create video record
      console.log('13. Creating video with duration:', duration);
      
      const video = new Video({
        title: req.body.title || 'Untitled',
        description: req.body.description || '',
        price: Number(req.body.price) || 50,
        url: videoFile.path,
        thumbnail: thumbnailFile?.path || '',
        duration: duration,
        uploader: req.userId,
        isPublic: req.body.isPublic === 'true'
      });

      console.log('14. Video object before save:', JSON.stringify(video, null, 2));
      
      await video.save();
      
      console.log('15. Video saved successfully with ID:', video._id);
      console.log('16. Duration in saved video:', video.duration);
      console.log('========== UPLOAD DEBUG END ==========\n');

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
      console.error('❌ CRITICAL ERROR:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;