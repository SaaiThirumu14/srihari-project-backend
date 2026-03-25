const Shoutout = require('../models/Shoutout');
const User = require('../models/User');
const GamificationService = require('../services/gamificationService');

const sendShoutout = async (req, res) => {
    try {
        const { toUserId, toUserName, message } = req.body;
        
        const shoutout = await Shoutout.create({
            fromUserId: req.user._id,
            fromUserName: req.user.name,
            toUserId,
            toUserName,
            message
        });

        // Reward the recipient
        await GamificationService.awardPoints(toUserId, 5, `Shoutout from ${req.user.name}: ${message}`);

        res.json({ success: true, message: 'Shoutout sent! Recipient earned 5 points.', shoutout });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getRecentShoutouts = async (req, res) => {
    try {
        const shoutouts = await Shoutout.find().sort({ createdAt: -1 }).limit(10);
        res.json(shoutouts);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { sendShoutout, getRecentShoutouts };
