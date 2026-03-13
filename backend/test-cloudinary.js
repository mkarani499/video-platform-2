// test-cloudinary.js
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Log what credentials are loaded (hide full secret)
console.log('🔍 Testing Cloudinary connection...');
console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✅ Present' : '❌ Missing');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Present' : '❌ Missing');

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test 1: Try to get account info (simple ping)
async function testCloudinary() {
  try {
    console.log('\n📡 Testing Cloudinary API connection...');
    
    // Simple ping test [citation:2]
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary ping successful:', result);
    
    // Test 2: Try to upload a tiny test string as an image
    console.log('\n📤 Testing upload functionality...');
    const uploadResult = await cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', {
      public_id: 'test-connection',
      folder: 'test'
    });
    console.log('✅ Upload successful:', uploadResult.public_id);
    
    // Test 3: Clean up - delete test image
    console.log('\n🗑️ Cleaning up...');
    await cloudinary.uploader.destroy('test/test-connection');
    console.log('✅ Test image deleted');
    
    console.log('\n🎉 Cloudinary is working perfectly!');
    
  } catch (error) {
    console.error('\n❌ Cloudinary test failed:');
    console.error('Error message:', error.message);
    console.error('Error details:', error);
    
    // Specific error diagnosis [citation:7]
    if (error.message.includes('Invalid cloud_name')) {
      console.error('👉 Problem: Cloud name is incorrect');
    } else if (error.message.includes('Invalid API key')) {
      console.error('👉 Problem: API key is incorrect');
    } else if (error.message.includes('Signature')) {
      console.error('👉 Problem: API secret is incorrect');
    }
  }
}

testCloudinary();