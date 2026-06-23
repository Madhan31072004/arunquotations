const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  slNo: { type: Number },
  description: { type: String, required: true },
  finish: { type: String, default: '' },
  materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
  specification: { type: String, default: '' },
  unit: { type: String, default: 'sq.ft' },
  length: { type: Number, default: 0 },
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
  remarks: { type: String, default: '' },
}, { _id: true });

const areaSchema = new mongoose.Schema({
  areaName: { type: String, required: true },
  description: { type: String, default: '' },
  items: [lineItemSchema],
  subtotal: { type: Number, default: 0 },
}, { _id: true });

const quotationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  quotationNumber: { type: String, required: true, unique: true },
  title: { type: String, default: 'Untitled Quotation' },
  status: {
    type: String,
    enum: ['draft', 'sent', 'approved', 'rejected', 'revised'],
    default: 'draft',
  },
  validUntil: { type: Date },

  areas: [areaSchema],

  subtotal: { type: Number, default: 0 },
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  discountValue: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  taxType: { type: String, default: 'gst18' },
  taxPercentage: { type: Number, default: 18 },
  taxAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },

  notes: { type: String, default: '' },
  termsAndConditions: [{ type: String }],
  pdfUrl: { type: String, default: '' },

  revisionHistory: [{
    version: Number,
    changes: String,
    timestamp: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

quotationSchema.index({ userId: 1, status: 1 });
quotationSchema.index({ userId: 1, clientId: 1 });

// Auto-calculate totals before save
quotationSchema.pre('save', function (next) {
  try {
    // Calculate area subtotals
    this.areas.forEach((area) => {
      area.items.forEach((item, idx) => {
        item.slNo = idx + 1;
        const h = item.height || 0;
        const w = item.width || 0;
        const dimensionArea = (h > 0 && w > 0) ? (h * w) : 1;
        item.amount = dimensionArea * (item.quantity || 0) * (item.unitPrice || 0);
      });
      area.subtotal = area.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    });

    // Calculate quotation totals
    this.subtotal = this.areas.reduce((sum, area) => sum + (area.subtotal || 0), 0);

    // Discount
    if (this.discountType === 'percentage') {
      this.discountAmount = (this.subtotal * (this.discountValue || 0)) / 100;
    } else {
      this.discountAmount = this.discountValue || 0;
    }

    const afterDiscount = this.subtotal - this.discountAmount;

    // Tax
    this.taxAmount = (afterDiscount * (this.taxPercentage || 0)) / 100;

    // Grand total
    this.grandTotal = afterDiscount + this.taxAmount;

    if (typeof next === 'function') {
      next();
    }
  } catch (err) {
    if (typeof next === 'function') {
      next(err);
    } else {
      throw err;
    }
  }
});

module.exports = mongoose.model('Quotation', quotationSchema);
