const express = require('express');
const router = express.Router();
const { createAlert, getMyAlerts, getAllAlerts, updateAlertStatus } = require('../controllers/promotionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('Admin', 'TeamLeader', 'HR'), createAlert);
router.get('/my', protect, getMyAlerts);
router.get('/all', protect, authorize('Admin', 'HR', 'TeamLeader'), getAllAlerts);
router.put('/:id', protect, updateAlertStatus);

module.exports = router;
