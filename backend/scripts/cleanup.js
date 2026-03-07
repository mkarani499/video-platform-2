const mongoose = require('mongoose');
require('dotenv').config();

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Delete all users
    const result = await mongoose.connection.db.collection('users').deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} users`);
    
    console.log('🎉 Database cleaned! Now register a new user.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

cleanup();