const User = require('../models/User');
const PointTransaction = require('../models/PointTransaction');

class GamificationService {
    static async awardPoints(userId, amount, reason = 'Engagement') {
        try {
            const user = await User.findById(userId);
            if (!user) return null;

            user.points = (user.points || 0) + amount;

            await PointTransaction.create({
                userId,
                amount: Math.abs(amount),
                type: amount >= 0 ? 'Credit' : 'Debit',
                description: reason
            });

            await user.save();

            // Real-time Update via Socket.IO
            if (global.io) {
                global.io.to(`user_${userId}`).emit('points_updated', {
                    points: user.points,
                    amount,
                    reason
                });
            }

            return user;
        } catch (error) {
            console.error('GamificationService.awardPoints Error:', error);
            throw error;
        }
    }

    static async updateTaskMetrics(userId, difficulty) {
        try {
            const user = await User.findById(userId);
            if (!user) return null;

            const incrementMap = { 'Easy': 2, 'Medium': 5, 'Hard': 10 };
            const inc = incrementMap[difficulty] || 5;

            user.performance.workCapability = Math.min(100, user.performance.workCapability + inc);
            user.performance.timeManagement = Math.min(100, user.performance.timeManagement + inc);
            user.performance.problemSolving = Math.min(100, user.performance.problemSolving + inc);

            user.performance.overallScore = (
                user.performance.workCapability +
                user.performance.timeManagement +
                user.performance.problemSolving
            ) / 3;

            if (user.performance.overallScore >= 80 && user.promotionStatus === 'None') {
                user.promotionStatus = 'Eligible';
            }

            await user.save();
            return user;
        } catch (error) {
            console.error('GamificationService.updateTaskMetrics Error:', error);
            throw error;
        }
    }

    static async rewardWellness(userId) {
        return this.awardPoints(userId, 10, 'Wellness Check-in');
    }

    static async rewardFoodOrder(userId, price) {
        const points = Math.floor(price / 10);
        return this.awardPoints(userId, points, 'Cafeteria Order');
    }

    static async rewardSurvey(userId) {
        return this.awardPoints(userId, 20, 'Churn Survey Completion');
    }
}

module.exports = GamificationService;
