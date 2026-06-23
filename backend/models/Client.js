const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: [true, 'Client name is required'], trim: true },
  email: { type: String, trim: true, default: '' },
  phone: { type: String, trim: true, default: '' },
  address: { type: String, default: '' },
  projectName: { type: String, default: '' },
  notes: { type: String, default: '' },
}, { timestamps: true });

clientSchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model('Client', clientSchema);
