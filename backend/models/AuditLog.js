const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: {
    type: String,
    enum: [
      'login', 'logout', 'change_password', 'force_signout',
      'create_quotation', 'update_quotation', 'delete_quotation', 'send_quotation',
      'create_client', 'update_client', 'delete_client',
      'quotation_viewed', 'quotation_accepted',
      'update_settings', 'update_profile',
    ],
    required: true,
  },
  targetType: {
    type: String,
    enum: ['quotation', 'client', 'user', 'settings', 'session'],
    default: 'user',
  },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: String, default: '' },
  deviceName: { type: String, default: '' },
  browser: { type: String, default: '' },
  os: { type: String, default: '' },
  ipAddress: { type: String, default: '' },
}, { timestamps: true });

// Auto-delete logs older than 90 days
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
