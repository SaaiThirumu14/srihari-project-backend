const express = require('express');
const router = express.Router();
const { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus } = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/apply', protect, applyLeave);
router.get('/my-leaves', protect, getMyLeaves);
router.get('/all', protect, authorize('Admin', 'HR', 'TeamLeader'), getAllLeaves);
router.put('/:id', protect, authorize('Admin', 'HR', 'TeamLeader'), updateLeaveStatus);

module.exports = router;
