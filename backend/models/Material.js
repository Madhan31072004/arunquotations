const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: [true, 'Material name is required'], trim: true },
  category: { type: String, required: true, trim: true },
  unit: { type: String, required: true, default: 'sq.ft' },
  unitPrice: { type: Number, required: true, default: 0 },
  brand: { type: String, default: '' },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

materialSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Material', materialSchema);
