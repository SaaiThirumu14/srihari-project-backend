const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: String, enum: ['employee', 'hr'], required: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    content: { type: String, required: true, trim: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
});

const chatSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    employeeName: { type: String, required: true },
    messages: [messageSchema],
    lastActivity: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', chatSchema);
