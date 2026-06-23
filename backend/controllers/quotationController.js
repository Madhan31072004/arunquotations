const Quotation = require('../models/Quotation');
const CompanyProfile = require('../models/CompanyProfile');

// Generate unique quotation number starting from 1 (001)
const generateQuotationNumber = async (userId) => {
  const year = new Date().getFullYear();

  let prefix = 'AQ';
  try {
    const profile = await CompanyProfile.findOne({ userId });
    if (profile && profile.quotationPrefix) {
      prefix = profile.quotationPrefix;
    }
  } catch (error) {
    console.error('Error fetching company profile for prefix:', error);
  }

  let nextNum = 1;
  try {
    // Find the latest quotation with the current prefix and year
    const latestQuotation = await Quotation.findOne({
      userId,
      quotationNumber: new RegExp(`^${prefix}-${year}-`)
    }).sort({ quotationNumber: -1 });

    if (latestQuotation && latestQuotation.quotationNumber) {
      const parts = latestQuotation.quotationNumber.split('-');
      const lastPart = parts[parts.length - 1];
      const numericVal = parseInt(lastPart, 10);
      if (!isNaN(numericVal)) {
        nextNum = numericVal + 1;
      }
    } else {
      // If no quotation matches prefix, fall back to count + 1
      const count = await Quotation.countDocuments({ userId });
      nextNum = count + 1;
    }
  } catch (error) {
    console.error('Error calculating next quotation number:', error);
    const count = await Quotation.countDocuments({ userId });
    nextNum = count + 1;
  }

  const num = String(nextNum).padStart(3, '0');
  return `${prefix}-${year}-${num}`;
};

// @route   GET /api/quotations
exports.getQuotations = async (req, res) => {
  try {
    const filter = { userId: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const quotations = await Quotation.find(filter)
      .populate('clientId', 'name phone projectName')
      .sort({ updatedAt: -1 });

    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/quotations
exports.createQuotation = async (req, res) => {
  try {
    const quotationNumber = await generateQuotationNumber(req.user._id);
    console.log('Backend generating quotation number:', quotationNumber);
    const quotation = await Quotation.create({
      ...req.body,
      userId: req.user._id,
      quotationNumber,
    });
    res.status(201).json(quotation);
  } catch (error) {
    console.error('BACKEND CREATE QUOTATION ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/quotations/:id
exports.getQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('clientId')
      .populate('areas.items.materialId', 'name category unit unitPrice');

    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/quotations/:id
exports.updateQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findOne({ _id: req.params.id, userId: req.user._id });
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    Object.assign(quotation, req.body);
    await quotation.save(); // triggers pre-save calculations

    const populated = await quotation.populate('clientId', 'name phone projectName');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/quotations/:id
exports.deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json({ message: 'Quotation deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PATCH /api/quotations/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const quotation = await Quotation.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status },
      { new: true }
    );
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
