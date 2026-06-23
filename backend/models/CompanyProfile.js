const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  companyName: { type: String, default: '' },
  logo: { type: String, default: '' },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  website: { type: String, default: '' },
  gstNumber: { type: String, default: '' },
  tagline: { type: String, default: '' },
  primaryColor: { type: String, default: '#C9A351' },
  footerText: { type: String, default: '' },
  termsAndConditions: [{ type: String }],
  taxPercentage: { type: Number, default: 18 },
  quotationPrefix: { type: String, default: 'AQ' },
  pdfTheme: { type: String, default: 'default' }
}, { timestamps: true });

module.exports = mongoose.model('CompanyProfile', companyProfileSchema);
