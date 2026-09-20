const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // Debug: show if env var is loaded (mask the password)
  if (uri) {
    const masked = uri.replace(/:([^@]+)@/, ':****@');
    console.log(`🔗 MONGODB_URI loaded: ${masked}`);
  } else {
    console.error('❌ MONGODB_URI is NOT SET! Check your Render environment variables.');
    console.log('Available env keys:', Object.keys(process.env).filter(k => !k.startsWith('npm_')).join(', '));
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
