const Leave = require('../models/Leave');

const applyLeave = async (req, res) => {
    try {
        const { startDate, endDate, reason } = req.body;
        const newLeave = new Leave({ employeeId: req.user._id, startDate, endDate, reason });
        await newLeave.save();
        res.json(newLeave);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ employeeId: req.user._id }).sort({ appliedAt: -1 });
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find().populate('employeeId', 'name department email').sort({ appliedAt: -1 });
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateLeaveStatus = async (req, res) => {
    try {
        const { status } = req.body;
        let leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).json({ message: 'Leave not found' });
        leave.status = status;
        await leave.save();
        res.json(leave);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus };
