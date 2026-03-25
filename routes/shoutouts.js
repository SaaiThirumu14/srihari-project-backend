const express = require('express');
const router = express.Router();
const { sendShoutout, getRecentShoutouts } = require('../controllers/shoutoutController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendShoutout);
router.get('/', protect, getRecentShoutouts);

module.exports = router;
