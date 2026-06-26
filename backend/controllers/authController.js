const jwt = require('jsonwebtoken');
const User = require('../models/User');
const CompanyProfile = require('../models/CompanyProfile');
const Session = require('../models/Session');

const generateToken = (id, tokenVersion = 0) => {
  return jwt.sign({ id, tokenVersion }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });
};

// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, phone });

    // Create default company profile
    await CompanyProfile.create({
      userId: user._id,
      companyName: name + "'s Studio",
    });

    const token = generateToken(user._id, user.tokenVersion || 0);

    // Create session record
    const userAgent = req.headers['user-agent'] || '';
    const { deviceName, browser, os } = Session.parseUserAgent(userAgent);
    const ipAddress = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.ip || '';

    await Session.create({
      userId: user._id,
      tokenHash: Session.hashToken(token),
      deviceName,
      browser,
      os,
      ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : '',
    });

    res.status(201).json({
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.tokenVersion || 0);

    // Create session record with device info
    const userAgent = req.headers['user-agent'] || '';
    const { deviceName, browser, os } = Session.parseUserAgent(userAgent);
    const ipAddress = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.ip || '';

    await Session.create({
      userId: user._id,
      tokenHash: Session.hashToken(token),
      deviceName,
      browser,
      os,
      ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : '',
    });

    res.json({
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({
    user: { _id: req.user._id, name: req.user.name, email: req.user.email, phone: req.user.phone, role: req.user.role },
  });
};

// @route   PUT /api/auth/me
exports.updateMe = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (password) user.password = password;

    await user.save();

    res.json({
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/auth/sessions
// @desc    Get all active sessions for the logged-in user
exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id })
      .sort({ lastActive: -1 })
      .lean();

    // Mark the current session
    const currentTokenHash = req.tokenHash;
    const result = sessions.map((s) => ({
      _id: s._id,
      deviceName: s.deviceName,
      browser: s.browser,
      os: s.os,
      ipAddress: s.ipAddress,
      lastActive: s.lastActive,
      createdAt: s.createdAt,
      isCurrent: s.tokenHash === currentTokenHash,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/auth/sessions/:id
// @desc    Revoke a specific session (remote sign-out)
exports.revokeSession = async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Prevent revoking your own current session via this endpoint
    if (session.tokenHash === req.tokenHash) {
      return res.status(400).json({ message: 'Cannot revoke your current session. Use Sign Out instead.' });
    }

    await Session.deleteOne({ _id: session._id });
    res.json({ message: 'Device signed out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/auth/sessions/all
// @desc    Revoke all sessions except the current one
exports.revokeAllSessions = async (req, res) => {
  try {
    const result = await Session.deleteMany({
      userId: req.user._id,
      tokenHash: { $ne: req.tokenHash },
    });

    res.json({
      message: `Signed out from ${result.deletedCount} device(s)`,
      revokedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/auth/change-password
// @desc    Change password with current password verification
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current password and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password and increment tokenVersion to invalidate ALL old tokens
    user.password = newPassword;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    // Delete all session records
    await Session.deleteMany({ userId: req.user._id });

    // Create a fresh session with a new token for the current device
    const newToken = generateToken(user._id, user.tokenVersion);
    const userAgent = req.headers['user-agent'] || '';
    const { deviceName, browser, os } = Session.parseUserAgent(userAgent);
    const ipAddress = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.ip || '';
    await Session.create({
      userId: user._id,
      tokenHash: Session.hashToken(newToken),
      deviceName, browser, os,
      ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : '',
    });

    res.json({ message: 'Password updated successfully. All other devices have been signed out.', token: newToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/auth/logout
// @desc    Logout current session (revoke token server-side)
exports.logout = async (req, res) => {
  try {
    await Session.deleteOne({ tokenHash: req.tokenHash, userId: req.user._id });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/auth/force-signout-all
// @desc    Invalidate ALL tokens (including pre-feature ones) by incrementing tokenVersion
exports.forceSignOutAll = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    // Delete all session records
    await Session.deleteMany({ userId: req.user._id });

    // Create a fresh session with a new token for the current device
    const newToken = generateToken(user._id, user.tokenVersion);
    const userAgent = req.headers['user-agent'] || '';
    const { deviceName, browser, os } = Session.parseUserAgent(userAgent);
    const ipAddress = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.ip || '';
    await Session.create({
      userId: user._id,
      tokenHash: Session.hashToken(newToken),
      deviceName, browser, os,
      ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : '',
    });

    res.json({
      message: 'All devices have been signed out. You have been re-authenticated on this device.',
      token: newToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
