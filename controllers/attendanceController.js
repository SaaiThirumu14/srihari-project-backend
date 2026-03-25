const Attendance = require('../models/Attendance');
const { detectAnomaly } = require('../services/geminiService');

const checkIn = async (req, res) => {
    try {
        const { location, device } = req.body;
        const now = new Date();

        // Gemini-powered anomaly detection
        const anomaly = await detectAnomaly(now.toISOString(), req.user.name);

        const newAttendance = new Attendance({
            employeeId: req.user._id, date: now, checkIn: now, status: 'Present',
            location, device,
            anomalyDetected: anomaly.isAnomaly, anomalyReason: anomaly.reason || ''
        });
        await newAttendance.save();
        res.json(newAttendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const checkOut = async (req, res) => {
    try {
        let attendance = await Attendance.findOne({
            employeeId: req.user._id,
            date: { $gte: new Date().setHours(0, 0, 0, 0) },
            checkOut: { $exists: false }
        });
        if (!attendance) return res.status(400).json({ message: 'No active check-in found' });
        attendance.checkOut = new Date();
        await attendance.save();
        res.json(attendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getHistory = async (req, res) => {
    try {
        const history = await Attendance.find({ employeeId: req.user._id }).sort({ date: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAllAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find().populate('employeeId', 'name department email').sort({ date: -1 });
        res.json(attendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { checkIn, checkOut, getHistory, getAllAttendance };
