const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getHistory, getAllAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/history', protect, getHistory);
router.get('/all', protect, authorize('Admin', 'HR', 'TeamLeader'), getAllAttendance);

module.exports = router;
