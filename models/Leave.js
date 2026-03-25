const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    appliedAt: { type: Date, default: Date.now },
    aiRecommendation: { type: String },
    aiConfidence: { type: Number }
});

module.exports = mongoose.model('Leave', leaveSchema);
