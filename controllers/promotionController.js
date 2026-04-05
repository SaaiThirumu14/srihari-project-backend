const PromotionAlert = require('../models/PromotionAlert');
const User = require('../models/User'); // We might want to include user info

const createAlert = async (req, res) => {
    const { employeeId, message, type } = req.body;
    try {
        const alert = await PromotionAlert.create({ employee: employeeId, triggeredBy: req.user.id, message, type });
        res.status(201).json(alert);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getMyAlerts = async (req, res) => {
    try {
        const alerts = await PromotionAlert.findAll({
            where: { employee: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllAlerts = async (req, res) => {
    try {
        // We fetch all to let Admin/HR see the statuses of all offered promotions
        const alerts = await PromotionAlert.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateAlertStatus = async (req, res) => {
    try {
        const alert = await PromotionAlert.findByPk(req.params.id);
        if (!alert) return res.status(404).json({ message: 'Alert not found' });
        alert.status = req.body.status || alert.status;
        await alert.save();
        
        // If employee Accepts the PromotionOffer, update their user record
        if (alert.type === 'PromotionOffer' && alert.status === 'Accepted') {
            const user = await User.findByPk(alert.employee);
            if (user) {
                user.promotionStatus = 'Promoted';
                await user.save();
            }
        }
        
        res.json(alert);
    } catch (error) {
        console.error("Promotion Update Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createAlert, getMyAlerts, getAllAlerts, updateAlertStatus };
