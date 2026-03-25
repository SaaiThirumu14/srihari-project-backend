const express = require('express');
const router = express.Router();
const { addWellnessEntry, getAnalytics } = require('../controllers/wellnessController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addWellnessEntry);
router.get('/analytics', protect, getAnalytics);

module.exports = router;
