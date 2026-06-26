const mongoose = require('mongoose');
const crypto = require('crypto');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  tokenHash: {
    type: String,
    required: true,
    unique: true,
  },
  deviceName: {
    type: String,
    default: 'Unknown Device',
  },
  browser: {
    type: String,
    default: 'Unknown Browser',
  },
  os: {
    type: String,
    default: 'Unknown OS',
  },
  ipAddress: {
    type: String,
    default: '',
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Hash a token for secure storage
sessionSchema.statics.hashToken = function (token) {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Parse User-Agent string to extract device info
sessionSchema.statics.parseUserAgent = function (ua) {
  if (!ua) return { deviceName: 'Unknown Device', browser: 'Unknown', os: 'Unknown' };

  let browser = 'Unknown';
  let os = 'Unknown';
  let deviceName = 'Unknown Device';

  // Detect browser
  if (ua.includes('Edg/') || ua.includes('Edge/')) {
    browser = 'Microsoft Edge';
  } else if (ua.includes('OPR/') || ua.includes('Opera/')) {
    browser = 'Opera';
  } else if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
    browser = 'Google Chrome';
  } else if (ua.includes('Firefox/')) {
    browser = 'Mozilla Firefox';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    browser = 'Safari';
  } else if (ua.includes('MSIE') || ua.includes('Trident/')) {
    browser = 'Internet Explorer';
  }

  // Detect OS
  if (ua.includes('Windows NT 10.0')) {
    os = 'Windows 10/11';
  } else if (ua.includes('Windows NT')) {
    os = 'Windows';
  } else if (ua.includes('Mac OS X')) {
    os = 'macOS';
  } else if (ua.includes('Android')) {
    os = 'Android';
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS';
  } else if (ua.includes('Linux')) {
    os = 'Linux';
  } else if (ua.includes('CrOS')) {
    os = 'Chrome OS';
  }

  // Detect device type
  if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
    if (ua.includes('iPhone')) {
      deviceName = 'iPhone';
    } else if (ua.includes('iPad')) {
      deviceName = 'iPad';
    } else if (ua.includes('Android')) {
      deviceName = 'Android Phone';
    } else {
      deviceName = 'Mobile Device';
    }
  } else if (ua.includes('Tablet') || ua.includes('iPad')) {
    deviceName = 'Tablet';
  } else {
    if (os.includes('Windows')) {
      deviceName = 'Windows PC';
    } else if (os.includes('macOS')) {
      deviceName = 'Mac';
    } else if (os.includes('Linux')) {
      deviceName = 'Linux PC';
    } else {
      deviceName = 'Desktop';
    }
  }

  return { deviceName, browser, os };
};

// Auto-delete sessions older than 30 days
sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Session', sessionSchema);
