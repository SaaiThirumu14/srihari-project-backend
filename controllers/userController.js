const User = require('../models/User');
const PointTransaction = require('../models/PointTransaction');
const GamificationService = require('../services/gamificationService');

const getUsers = async (req, res) => {
    try {
        const where = {};
        if (req.user.role === 'TeamLeader' && req.user.department) {
            where.department = req.user.department;
        }
        const users = await User.findAll({ where, attributes: { exclude: ['password'] } });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updatePromotion = async (req, res) => {
    const { promotionStatus } = req.body;
    try {
        const user = await User.findByPk(req.params.id);
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
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (points !== undefined) {
            const diff = Number(points) - (user.points || 0);
            if (diff !== 0) await GamificationService.awardPoints(user.id, diff, 'Manual Adjustment');
        }
        if (performance) {
            const wc = Number(performance.workCapability) || 0;
            const tm = Number(performance.timeManagement) || 0;
            const ps = Number(performance.problemSolving) || 0;
            const avg = (wc + tm + ps) / 3;
            user.performance = { 
                workCapability: wc, 
                timeManagement: tm, 
                problemSolving: ps, 
                overallScore: avg * 10 
            };
            
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
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.promotionStatus !== 'Eligible' && user.promotionStatus !== 'Pending') {
            return res.status(400).json({ message: 'Must be Eligible first' });
        }
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
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        await GamificationService.awardPoints(user.id, Number(amount), 'Admin Allocation');
        res.json({ message: 'Points allocated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getPointTransactions = async (req, res) => {
    try {
        const transactions = await PointTransaction.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
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
        const user = await User.findByPk(req.params.id);
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
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.demerits = (user.demerits || 0) + Number(amount);
        user.points = Math.max(0, (user.points || 0) - Number(amount));
        await user.save();

        await PointTransaction.create({
            userId: user.id,
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
