const express = require('express');
const router = express.Router();
const { getChat, getAllChats, sendMessage, markRead } = require('../controllers/chatController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('HR', 'Admin'), getAllChats);
router.get('/:employeeId', protect, getChat);
router.post('/send', protect, sendMessage);
router.put('/read/:employeeId', protect, markRead);

module.exports = router;
