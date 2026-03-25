const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Late', 'On Leave'],
        default: 'Absent'
    },
    location: { type: String },
    device: { type: String },
    anomalyDetected: { type: Boolean, default: false },
    anomalyReason: { type: String }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
