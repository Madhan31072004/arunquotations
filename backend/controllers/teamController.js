const User = require('../models/User');
const { logActivity } = require('./auditController');
const bcrypt = require('bcryptjs');

// @route   GET /api/team
// @desc    Get all team members
exports.getTeamMembers = async (req, res) => {
  try {
    const team = await User.find({ _id: { $ne: req.user._id } }).select('-password -tokenVersion').sort({ createdAt: -1 });
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/team
// @desc    Add a new team member (designer)
exports.addTeamMember = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    let userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'designer',
      isActive: true,
      invitedBy: req.user._id,
    });

    logActivity(req.user._id, 'update_settings', 'user', user._id, `Added team member ${user.name} (${user.email})`, req);
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PATCH /api/team/:id/status
// @desc    Toggle team member active status
exports.toggleTeamMemberStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot deactivate an admin' });

    user.isActive = isActive;
    
    // If deactivating, increment tokenVersion to forcefully logout their devices
    if (!isActive) {
      user.tokenVersion += 1;
    }
    
    await user.save();

    logActivity(req.user._id, 'update_settings', 'user', user._id, `${isActive ? 'Activated' : 'Deactivated'} team member ${user.name}`, req);
    
    res.json({ message: 'User status updated successfully', isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/team/:id
// @desc    Delete a team member
exports.deleteTeamMember = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete an admin' });

    await user.deleteOne();
    
    logActivity(req.user._id, 'update_settings', 'user', user._id, `Deleted team member ${user.name}`, req);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
