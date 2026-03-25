const Chat = require('../models/Chat');
const User = require('../models/User');

const getChat = async (req, res) => {
    try {
        let chat = await Chat.findOne({ employeeId: req.params.employeeId });
        if (!chat) {
            const emp = await User.findById(req.params.employeeId);
            if (!emp) return res.status(404).json({ message: 'Employee not found' });
            chat = await Chat.create({ employeeId: req.params.employeeId, employeeName: emp.name, messages: [] });
        }
        res.json({ chat });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAllChats = async (req, res) => {
    try {
        const chats = await Chat.find({}).sort({ lastActivity: -1 });
        res.json({ chats });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { employeeId, content } = req.body;
        const sender = req.user.role === 'HR' ? 'hr' : 'employee';

        let chat = await Chat.findOne({ employeeId });
        if (!chat) {
            const emp = await User.findById(employeeId);
            chat = await Chat.create({ employeeId, employeeName: emp ? emp.name : 'Employee', messages: [] });
        }

        const message = { sender, senderId: req.user._id.toString(), senderName: req.user.name, content, timestamp: new Date() };
        chat.messages.push(message);
        chat.lastActivity = new Date();
        await chat.save();

        res.json({ message: chat.messages[chat.messages.length - 1], chat });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const markRead = async (req, res) => {
    try {
        const chat = await Chat.findOne({ employeeId: req.params.employeeId });
        if (!chat) return res.json({ message: 'No chat found' });

        const role = req.user.role;
        chat.messages.forEach(msg => {
            if (role === 'HR' && msg.sender === 'employee') msg.read = true;
            if (role !== 'HR' && msg.sender === 'hr') msg.read = true;
        });
        await chat.save();
        res.json({ message: 'Messages marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getChat, getAllChats, sendMessage, markRead };
