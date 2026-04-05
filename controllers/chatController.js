const Chat = require('../models/Chat');
const User = require('../models/User');

const getChat = async (req, res) => {
    try {
        let chat = await Chat.findOne({ where: { employeeId: req.params.employeeId } });
        if (!chat) {
            const emp = await User.findByPk(req.params.employeeId);
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
        const chats = await Chat.findAll({ order: [['lastActivity', 'DESC']] });
        res.json({ chats });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { employeeId, content } = req.body;
        const sender = req.user.role === 'HR' ? 'hr' : 'employee';

        let chat = await Chat.findOne({ where: { employeeId } });
        if (!chat) {
            const emp = await User.findByPk(employeeId);
            chat = await Chat.create({ employeeId, employeeName: emp ? emp.name : 'Employee', messages: [] });
        }

        const message = {
            sender,
            senderId: req.user.id.toString(),
            senderName: req.user.name,
            content,
            timestamp: new Date(),
            read: false
        };
        // JSON field — must reassign to trigger Sequelize change detection
        let existingMsgs = chat.messages || [];
        if (typeof existingMsgs === 'string') existingMsgs = JSON.parse(existingMsgs);
        const updatedMessages = [...existingMsgs, message];
        chat.messages = updatedMessages;
        chat.lastActivity = new Date();
        await chat.save();

        // Real-time push via Socket.io to both the employee and HR channels
        if (global.io) {
            global.io.to(`chat_${employeeId}`).emit('receive_message', message);
            global.io.to('hr_channel').emit('chat_update', { employeeId, message });
        }

        res.json({ message: updatedMessages[updatedMessages.length - 1], chat });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const markRead = async (req, res) => {
    try {
        const chat = await Chat.findOne({ where: { employeeId: req.params.employeeId } });
        if (!chat) return res.json({ message: 'No chat found' });

        const role = req.user.role;
        let msgs = chat.messages || [];
        if (typeof msgs === 'string') msgs = JSON.parse(msgs);
        
        const updatedMessages = msgs.map(msg => {
            if (role === 'HR' && msg.sender === 'employee') return { ...msg, read: true };
            if (role !== 'HR' && msg.sender === 'hr') return { ...msg, read: true };
            return msg;
        });
        chat.messages = updatedMessages;
        await chat.save();
        res.json({ message: 'Messages marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getChat, getAllChats, sendMessage, markRead };
