const express = require('express');
const router = express.Router();
const { uploadVideo } = require('../config/cloudinary');
const Video = require('../models/Video');
const auth = require('../middleware/auth');

// Upload video with optional thumbnail - DEBUG VERSION
router.post('/video-with-thumbnail', auth, (req, res, next) => {
  console.log('\n========== NEW UPLOAD REQUEST ==========');
  console.log('1. Time:', new Date().toISOString());
  console.log('2. Auth user:', req.userId);
  console.log('3. Content-Type:', req.headers['content-type']);
  console.log('4. Body fields present:', Object.keys(req.body));
  
  const upload = uploadVideo.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]);
  
  upload(req, res, function(err) {
    if (err) {
      console.log('5. ❌ MULTER ERROR:', {
        name: err.name,
        message: err.message,
        code: err.code,
        field: err.field
      });
      return res.status(400).json({ 
        error: 'Upload failed',
        details: err.message,
        code: err.code
      });
    }
    console.log('5. ✅ Multer processing complete');
    next();
  });
}, async (req, res) => {
  try {
    console.log('6. 🔍 FILES RECEIVED:');
    console.log('   - req.files keys:', req.files ? Object.keys(req.files) : 'none');
    
    // Check video
    const videoFile = req.files?.video?.[0];
    console.log('   - Video file:', videoFile ? '✅ PRESENT' : '❌ MISSING');
    if (videoFile) {
      console.log('     Original name:', videoFile.originalname);
      console.log('     Size:', videoFile.size, 'bytes');
      console.log('     Mimetype:', videoFile.mimetype);
      console.log('     Path:', videoFile.path);
    }
    
    // Check thumbnail
    const thumbnailFile = req.files?.thumbnail?.[0];
    console.log('   - Thumbnail file:', thumbnailFile ? '✅ PRESENT' : 'ℹ️ OPTIONAL (not provided)');
    if (thumbnailFile) {
      console.log('     Original name:', thumbnailFile.originalname);
      console.log('     Size:', thumbnailFile.size, 'bytes');
      console.log('     Mimetype:', thumbnailFile.mimetype);
      console.log('     Path:', thumbnailFile.path);
    }

    if (!videoFile) {
      console.log('7. ❌ No video file - aborting');
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    console.log('7. ✅ Creating video record');
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
    console.log('8. ✅ Video saved with ID:', video._id);
    console.log('9. ✅ Thumbnail saved:', thumbnailFile ? 'with thumbnail' : 'without thumbnail');
    console.log('========== REQUEST COMPLETE ==========\n');

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
    console.log('❌ SERVER ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;