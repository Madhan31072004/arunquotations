const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const generateToken = (id, tokenVersion = 0) => {
  return jwt.sign({ id, tokenVersion }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

async function testAll() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  
  const user = await User.findOne({ email: 'arun@demo.com' });
  if (!user) {
    console.log('User not found');
    return;
  }
  
  const token = generateToken(user._id, user.get('tokenVersion') || 0);
  console.log('Token generated manually.');
  
  // We need to create a session in the DB because auth middleware checks it!
  const Session = require('./models/Session');
  await Session.create({
    userId: user._id,
    tokenHash: Session.hashToken(token),
    deviceName: 'Test',
    browser: 'Test',
    os: 'Test',
    ipAddress: '127.0.0.1'
  });
  console.log('Session created');

  const headers = { Authorization: `Bearer ${token}` };
  
  const endpoints = [
    '/api/quotations',
    '/api/clients',
    '/api/company',
    '/api/auth/me',
    '/api/auth/sessions'
  ];
  
  for (const ep of endpoints) {
    try {
      const res = await axios.get(`http://localhost:5000${ep}`, { headers });
      console.log(`SUCCESS: ${ep} -> ${res.status}`);
    } catch (err) {
      console.error(`FAIL: ${ep} -> ${err.response ? err.response.status : err.message}`);
      if (err.response) console.error(err.response.data);
    }
  }
  
  await mongoose.disconnect();
}

testAll();
