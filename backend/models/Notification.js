const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['system', 'quotation', 'client', 'payment', 'other'], 
    default: 'system' 
  },
  icon: {
    type: String,
    default: 'notifications'
  },
  color: {
    type: String,
    default: '#3B82F6' // default info color
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  actionUrl: {
    type: String,
    default: ''
  }
}, { timestamps: true });

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
