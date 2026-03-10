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
    max_file_size: 100 * 1024 * 1024, // 100MB
    transformation: [
      { quality: 'auto', fetch_format: 'auto' } // Optimize for web
    ]
  }
});

// Configure storage for thumbnails
const thumbnailStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'video-platform/thumbnails',
    resource_type: 'image',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [
      { width: 640, height: 360, crop: 'fill' } // 16:9 thumbnail
    ]
  }
});

// Create multer upload middleware
const uploadVideo = multer({ 
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

const uploadThumbnail = multer({ 
  storage: thumbnailStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = {
  cloudinary,
  uploadVideo,
  uploadThumbnail
};