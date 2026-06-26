const User = require('../models/User');

const getAccessibleUserIds = async (user) => {
  if (user.role === 'admin') {
    // Admin sees their own stuff AND stuff created by people they invited
    const team = await User.find({ invitedBy: user._id }).select('_id');
    const teamIds = team.map(t => t._id);
    return [user._id, ...teamIds];
  }
  // Designer only sees their own stuff
  return [user._id];
};

module.exports = { getAccessibleUserIds };
