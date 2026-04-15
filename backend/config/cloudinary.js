const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Video storage (working)
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'video-platform/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm']
  }
});

// Thumbnail storage - SIMPLIFIED (remove format restrictions)
const thumbnailStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'video-platform/thumbnails',
    resource_type: 'image'
    // NO allowed_formats - let Cloudinary accept anything
  }
});

const uploadVideo = multer({ storage: videoStorage, limits: { fileSize: 100 * 1024 * 1024 } });
const uploadThumbnail = multer({ storage: thumbnailStorage, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = { cloudinary, uploadVideo, uploadThumbnail };