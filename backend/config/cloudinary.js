const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage for videos
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'video-platform/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }]
  }
});

// Configure storage for thumbnails - FIXED VERSION
const thumbnailStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'video-platform/thumbnails',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'JPG', 'JPEG'], // Include uppercase too
    transformation: [{ width: 640, height: 360, crop: 'fill' }]
  }
});

// Create multer upload middleware
const uploadVideo = multer({ 
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

const uploadThumbnail = multer({ 
  storage: thumbnailStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Add debug middleware to log what's being uploaded
const debugUpload = (req, res, next) => {
  console.log('📤 Upload request received:');
  console.log('Headers:', req.headers['content-type']);
  console.log('Body fields:', req.body);
  console.log('Files:', req.file);
  next();
};

module.exports = {
  cloudinary,
  uploadVideo,
  uploadThumbnail,
  debugUpload
};