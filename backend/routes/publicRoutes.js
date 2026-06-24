const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');
const CompanyProfile = require('../models/CompanyProfile');

// GET Public Quotation
router.get('/quotations/:id', async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('clientId', 'name email phone')
      .lean();
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    // Strip private info (costs and profit)
    delete quotation.totalCost;
    delete quotation.projectedProfit;
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

    res.json({ quotation, company });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST Accept Quotation
router.post('/quotations/:id/accept', async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    res.json({ message: 'Quotation approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
