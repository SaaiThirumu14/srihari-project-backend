const User = require('../models/User');
const PointTransaction = require('../models/PointTransaction');
const GamificationService = require('../services/gamificationService');

const getUsers = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'TeamLeader') query.role = 'Employee';
        const users = await User.find(query).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updatePromotion = async (req, res) => {
    const { promotionStatus } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.promotionStatus = promotionStatus;
        if (promotionStatus === 'Promoted') user.promotedAt = new Date();
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updatePerformance = async (req, res) => {
    const { points, performance } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (points !== undefined) {
            const diff = Number(points) - (user.points || 0);
            if (diff !== 0) await GamificationService.awardPoints(user._id, diff, 'Manual Adjustment');
        }
        if (performance) {
            const wc = Number(performance.workCapability) || 0;
            const tm = Number(performance.timeManagement) || 0;
            const ps = Number(performance.problemSolving) || 0;
            user.performance = { workCapability: wc, timeManagement: tm, problemSolving: ps, overallScore: (wc + tm + ps) / 3 };
            if (user.performance.overallScore >= 80 && user.promotionStatus === 'None') {
                user.promotionStatus = 'Eligible';
            }
        }
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const recommendPromotion = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.promotionStatus !== 'Eligible') return res.status(400).json({ message: 'Must be Eligible first' });
        user.promotionStatus = 'Pending';
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const addPoints = async (req, res) => {
    const { amount } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        await GamificationService.awardPoints(user._id, Number(amount), 'Admin Allocation');
        res.json({ message: 'Points allocated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getPointTransactions = async (req, res) => {
    try {
        const transactions = await PointTransaction.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateFace = async (req, res) => {
    try {
        const { faceEmbedding } = req.body;
        if (!faceEmbedding || faceEmbedding.length !== 128) {
            return res.status(400).json({ message: 'Invalid face embedding data' });
        }
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.faceEmbedding = faceEmbedding;
        await user.save();
        res.json({ message: 'Face embedding updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const addDemerits = async (req, res) => {
    const { amount, reason } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        user.demerits += Number(amount);
        // Deduct from Flux Score as well
        user.points = Math.max(0, user.points - Number(amount));
        await user.save();

        await PointTransaction.create({
            userId: user._id,
            amount: Number(amount),
            type: 'Debit',
            description: `Demerit Penalty: ${reason || 'AI Risk Assessment'}`
        });

        res.json({ message: 'Demerits issued', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getUsers, updatePromotion, updatePerformance, recommendPromotion, addPoints, getPointTransactions, updateFace, addDemerits };
