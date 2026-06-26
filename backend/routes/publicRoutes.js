const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');
const CompanyProfile = require('../models/CompanyProfile');
const { logActivity } = require('../controllers/auditController');

// GET Public Quotation (tracks client views)
router.get('/quotations/:id', async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('clientId', 'name email phone')
      .lean();
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    // Track this view (fire-and-forget, don't block the response)
    const ipAddress = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.ip || '';
    const userAgent = req.headers['user-agent'] || '';
    Quotation.findByIdAndUpdate(req.params.id, {
      $inc: { viewCount: 1 },
      $set: { lastViewedAt: new Date() },
      $push: {
        viewHistory: {
          $each: [{ viewedAt: new Date(), ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : '', userAgent: userAgent.substring(0, 200) }],
          $slice: -50, // Keep only last 50 views
        },
      },
    }).exec().catch(() => {}); // Silently ignore errors

    // Log the activity to the audit trail
    if (quotation.userId) {
      logActivity(quotation.userId, 'quotation_viewed', 'quotation', quotation._id, `Client viewed quotation ${quotation.quotationNumber}`, req);
    }

    // Check if expired
    const isExpired = quotation.validUntil && new Date(quotation.validUntil) < new Date();

    // Strip private info (costs and profit)
    delete quotation.totalCost;
    delete quotation.projectedProfit;
    delete quotation.viewCount;
    delete quotation.lastViewedAt;
    delete quotation.viewHistory;
    if (quotation.areas) {
      quotation.areas.forEach(area => {
        if (area.items) {
          area.items.forEach(item => {
            delete item.costPrice;
          });
        }
      });
    }

    const company = await CompanyProfile.findOne().lean();

    res.json({ quotation, company, isExpired });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST Accept Quotation
router.post('/quotations/:id/accept', async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    // Block acceptance of expired quotations
    if (quotation.validUntil && new Date(quotation.validUntil) < new Date()) {
      return res.status(400).json({ message: 'This quotation has expired and can no longer be accepted. Please contact us for a revised quote.' });
    }

    quotation.status = 'approved';
    await quotation.save();

    if (quotation.userId) {
      logActivity(quotation.userId, 'quotation_accepted', 'quotation', quotation._id, `Client accepted quotation ${quotation.quotationNumber}`, req);
    }

    res.json({ message: 'Quotation approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
