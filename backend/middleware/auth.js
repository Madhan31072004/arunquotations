const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    // Check tokenVersion — if admin used "Force Sign Out All", this rejects ALL old tokens
    const currentVersion = user.tokenVersion || 0;
    const tokenVersion = decoded.tokenVersion !== undefined ? decoded.tokenVersion : 0;
    if (tokenVersion !== currentVersion) {
      return res.status(401).json({ message: 'Session invalidated. Please login again.' });
    }

    // Validate that the session still exists (makes tokens revocable)
    const tokenHash = Session.hashToken(token);
    const session = await Session.findOne({ tokenHash, userId: user._id });

    if (!session) {
      return res.status(401).json({ message: 'Session expired or revoked. Please login again.' });
    }

    let activeSession = session;

    // Update last active timestamp (throttle to every 5 minutes to reduce DB writes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (activeSession.lastActive < fiveMinutesAgo) {
      activeSession.lastActive = new Date();
      await activeSession.save();
    }

    req.user = user;
    req.token = token;
    req.tokenHash = tokenHash;
    req.sessionId = activeSession._id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = auth;
