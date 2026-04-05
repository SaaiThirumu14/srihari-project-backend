const Leave = require('../models/Leave');
const User = require('../models/User');

const applyLeave = async (req, res) => {
    try {
        const { startDate, endDate, reason } = req.body;
        const newLeave = await Leave.create({ employeeId: req.user.id, startDate, endDate, reason });
        res.json(newLeave);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.findAll({
            where: { employeeId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.findAll({
            order: [['createdAt', 'DESC']],
            include: [{ model: User, as: 'employee', attributes: ['name', 'department', 'email'] }]
        });
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateLeaveStatus = async (req, res) => {
    try {
        const leave = await Leave.findByPk(req.params.id);
        if (!leave) return res.status(404).json({ message: 'Leave not found' });
        leave.status = req.body.status;
        await leave.save();
        res.json(leave);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus };
