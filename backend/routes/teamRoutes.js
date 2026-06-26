const express = require('express');
const router = express.Router();
const { getTeamMembers, addTeamMember, toggleTeamMemberStatus, deleteTeamMember } = require('../controllers/teamController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, adminOnly, getTeamMembers);
router.post('/', auth, adminOnly, addTeamMember);
router.patch('/:id/status', auth, adminOnly, toggleTeamMemberStatus);
router.delete('/:id', auth, adminOnly, deleteTeamMember);

module.exports = router;
