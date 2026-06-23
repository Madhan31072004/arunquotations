const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const CompanyProfile = require('../models/CompanyProfile');

// @route   GET /api/company
// @desc    Get user's company profile
// @access  Private
router.get('/', auth, async (req, res, next) => {
  try {
    let profile = await CompanyProfile.findOne({ userId: req.user._id });
    if (!profile) {
      // Create default if it doesn't exist
      profile = await CompanyProfile.create({ userId: req.user._id, companyName: 'Arun Quotations' });
    }
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/company
// @desc    Update user's company profile
// @access  Private
router.put('/', auth, async (req, res, next) => {
  try {
    let profile = await CompanyProfile.findOne({ userId: req.user._id });
    
    if (profile) {
      // Update
      profile = await CompanyProfile.findOneAndUpdate(
        { userId: req.user._id },
        { $set: req.body },
        { new: true, runValidators: true }
      );
    } else {
      // Create
      profile = await CompanyProfile.create({
        ...req.body,
        userId: req.user._id
      });
    }
    
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
