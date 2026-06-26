const AuditLog = require('../models/AuditLog');
const Session = require('../models/Session');

// Helper: Log an activity (call this from any controller)
const logActivity = async (userId, action, targetType, targetId, details, req) => {
  try {
    const userAgent = req?.headers?.['user-agent'] || '';
    const { deviceName, browser, os } = Session.parseUserAgent(userAgent);
    const ipAddress = req?.headers?.['x-forwarded-for'] || req?.connection?.remoteAddress || req?.ip || '';

    await AuditLog.create({
      userId,
      action,
      targetType,
      targetId,
      details,
      deviceName,
      browser,
      os,
      ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : '',
    });
  } catch (error) {
    console.error('Audit log error:', error.message);
    // Never block the main operation if audit logging fails
  }
};

// @route   GET /api/audit
// @desc    Get audit logs (paginated, filterable)
const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, targetType } = req.query;
    const filter = { userId: req.user._id };

    if (action) filter.action = action;
    if (targetType) filter.targetType = targetType;

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    const total = await AuditLog.countDocuments(filter);

    res.json({
      logs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { logActivity, getAuditLogs };
