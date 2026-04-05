const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { Op } = require('sequelize');
const { detectAnomaly } = require('../services/geminiService');

const checkIn = async (req, res) => {
    try {
        const { location, device, faceDescriptor } = req.body;
        const now = new Date();

        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Biometric Verification
        if (user.faceEmbedding && Array.isArray(user.faceEmbedding) && user.faceEmbedding.length > 0) {
            console.log(`Performing biometric verification for user: ${user.name}`);
            
            if (!faceDescriptor || !Array.isArray(faceDescriptor) || faceDescriptor.length !== 128) {
                console.warn(`Biometric check failed: Missing or invalid descriptor for ${user.name}`);
                return res.status(400).json({ message: 'Face verification required' });
            }

            // Calculate Euclidean Distance
            const distance = Math.sqrt(
                user.faceEmbedding.reduce((sum, val, i) => sum + Math.pow(Number(val) - Number(faceDescriptor[i]), 2), 0)
            );

            console.log(`Biometric distance for ${user.name}: ${distance.toFixed(4)}`);

            const THRESHOLD = 0.6; 
            if (distance > THRESHOLD) {
                console.warn(`Biometric verification rejected for ${user.name} (Distance: ${distance.toFixed(4)})`);
                return res.status(401).json({ message: 'Biometric verification failed' });
            }
            console.log(`Biometric verification successful for ${user.name}`);
        }

        const anomaly = await detectAnomaly(now.toISOString(), req.user.name);

        const newAttendance = await Attendance.create({
            employeeId: req.user.id,
            date: now,
            checkIn: now,
            status: 'Present',
            location,
            device,
            anomalyDetected: anomaly.isAnomaly,
            anomalyReason: anomaly.reason || ''
        });
        res.json(newAttendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const checkOut = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            where: {
                employeeId: req.user.id,
                date: { [Op.gte]: today },
                checkOut: null
            }
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
        const history = await Attendance.findAll({
            where: { employeeId: req.user.id },
            order: [['date', 'DESC']]
        });
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAllAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findAll({
            order: [['date', 'DESC']],
            include: [{ model: User, as: 'employee', attributes: ['name', 'department', 'email'] }]
        });
        res.json(attendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { checkIn, checkOut, getHistory, getAllAttendance };
