const express = require('express');
const router = express.Router();
const { getMaterials, createMaterial, getMaterial, updateMaterial, deleteMaterial } = require('../controllers/materialController');
const auth = require('../middleware/auth');

router.use(auth);
router.route('/').get(getMaterials).post(createMaterial);
router.route('/:id').get(getMaterial).put(updateMaterial).delete(deleteMaterial);

module.exports = router;
