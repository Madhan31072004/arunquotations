const express = require('express');
const router = express.Router();
const { getQuotations, createQuotation, getQuotation, updateQuotation, deleteQuotation, updateStatus, sendQuotationEmail } = require('../controllers/quotationController');
const auth = require('../middleware/auth');

router.use(auth);
router.route('/').get(getQuotations).post(createQuotation);
router.route('/:id').get(getQuotation).put(updateQuotation).delete(deleteQuotation);
router.patch('/:id/status', updateStatus);
router.post('/:id/send-email', sendQuotationEmail);

module.exports = router;
