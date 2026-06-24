const Quotation = require('../models/Quotation');
const Client = require('../models/Client');
const Material = require('../models/Material');
const CompanyProfile = require('../models/CompanyProfile');
const User = require('../models/User');

// @route   GET /api/export
// @desc    Export all user data
exports.exportUserData = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all user-owned documents
    const [user, companyProfile, clients, materials, quotations] = await Promise.all([
      User.findById(userId).select('-password'),
      CompanyProfile.findOne({ userId }),
      Client.find({ userId }),
      Material.find({ userId }),
      Quotation.find({ userId }).populate('clientId').populate('areas.items.materialId')
    ]);

    const backupData = {
      timestamp: new Date().toISOString(),
      user,
      companyProfile,
      clients,
      materials,
      quotations
    };

    res.json(backupData);
  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ message: 'Failed to export data', error: error.message });
  }
};
