const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateMe,
  getSessions,
  revokeSession,
  revokeAllSessions,
  changePassword,
  logout,
} = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.put('/me', auth, updateMe);

// Session management (device management)
router.get('/sessions', auth, getSessions);
router.delete('/sessions/all', auth, revokeAllSessions);
router.delete('/sessions/:id', auth, revokeSession);

// Password change
router.put('/change-password', auth, changePassword);

// Logout (server-side session revocation)
router.post('/logout', auth, logout);

module.exports = router;
