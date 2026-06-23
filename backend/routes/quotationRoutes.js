const express = require('express');
const router = express.Router();
const { getQuotations, createQuotation, getQuotation, updateQuotation, deleteQuotation, updateStatus } = require('../controllers/quotationController');
const auth = require('../middleware/auth');

router.use(auth);
router.route('/').get(getQuotations).post(createQuotation);
router.route('/:id').get(getQuotation).put(updateQuotation).delete(deleteQuotation);
router.patch('/:id/status', updateStatus);

module.exports = router;
