const express = require('express');
const router = express.Router();
const { createAlert, getMyAlerts, updateAlertStatus } = require('../controllers/promotionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('Admin', 'TeamLeader'), createAlert);
router.get('/my', protect, getMyAlerts);
router.put('/:id', protect, updateAlertStatus);

module.exports = router;
