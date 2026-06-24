const express = require('express');
const router = express.Router();
const { exportUserData } = require('../controllers/exportController');
const auth = require('../middleware/auth');

router.use(auth);
router.route('/').get(exportUserData);

module.exports = router;
