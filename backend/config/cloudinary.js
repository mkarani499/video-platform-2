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

// Configure storage for thumbnails - FLEXIBLE VERSION
const thumbnailStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Log the file being processed
    console.log('🖼️ Processing thumbnail:', file.originalname);
    console.log('   MIME type:', file.mimetype);
    
    // Accept any image format
    const allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'];
    
    // Get file extension and convert to lowercase
    const extension = file.originalname.split('.').pop().toLowerCase();
    
    // Use original format if supported, otherwise default to jpg
    const format = allowedFormats.includes(extension) ? extension : 'jpg';
    
    console.log('   Detected format:', extension);
    console.log('   Using format:', format);
    
    return {
      folder: 'video-platform/thumbnails',
      resource_type: 'image',
      format: format,
      transformation: [{ width: 640, height: 360, crop: 'fill' }]
    };
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

module.exports = {
  cloudinary,
  uploadVideo,
  uploadThumbnail
};