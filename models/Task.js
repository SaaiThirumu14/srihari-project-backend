const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['Todo', 'InProgress', 'Completed', 'Verified'],
        default: 'Todo'
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    deadline: { type: Date },
    metrics: {
        completionAbility: { type: Number, default: 0 },
        timeEfficiency: { type: Number, default: 0 },
        qualityScore: { type: Number, default: 0 }
    },
    completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
