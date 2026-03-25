const mongoose = require('mongoose');

const PollOptionSchema = new mongoose.Schema({
    id: { type: String, required: true },
    label: { type: String, required: true },
    votes: { type: Number, default: 0 }
});

const PollSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [PollOptionSchema],
    votedEmployees: [{
        employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        optionId: { type: String },
        submittedAt: { type: Date, default: Date.now }
    }],
    status: { type: String, enum: ['Active', 'Closed'], default: 'Active' },
    endDate: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Poll', PollSchema);
