const PromotionAlert = require('../models/PromotionAlert');

const createAlert = async (req, res) => {
    const { employeeId, message, type } = req.body;
    try {
        const alert = await PromotionAlert.create({ employee: employeeId, triggeredBy: req.user._id, message, type });
        res.status(201).json(alert);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getMyAlerts = async (req, res) => {
    try {
        const alerts = await PromotionAlert.find({ employee: req.user._id }).sort({ createdAt: -1 });
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateAlertStatus = async (req, res) => {
    try {
        const alert = await PromotionAlert.findById(req.params.id);
        if (!alert) return res.status(404).json({ message: 'Alert not found' });
        alert.status = req.body.status || alert.status;
        await alert.save();
        res.json(alert);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createAlert, getMyAlerts, updateAlertStatus };
