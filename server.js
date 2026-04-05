require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { connectDB, sequelize } = require('./config/db');
const { initGemini } = require('./services/geminiService');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: ['http://localhost:5173', 'http://localhost:5174', process.env.CLIENT_URL], methods: ['GET', 'POST'], credentials: true }
});

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', process.env.CLIENT_URL], credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/promotions', require('./routes/promotions'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/leave', require('./routes/leave'));
app.use('/api/survey', require('./routes/survey'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/wellness', require('./routes/wellness'));
app.use('/api/food', require('./routes/food'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/shoutouts', require('./routes/shoutouts'));

app.get('/', (req, res) => res.json({
    message: '🚀 WorkspaceAI Backend Running (MySQL)',
    version: '2.0.0',
    features: ['Attendance', 'Leave', 'Tasks', 'Promotions', 'Churn AI', 'Wellness', 'Cafeteria', 'Chat', 'Gemini 2.5 AI']
}));

// Socket.IO — Real-time Chat & Gamification
global.io = io;
io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    socket.on('join_user', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`👤 User ${userId} joined their private channel`);
    });

    socket.on('join_chat', (employeeId) => {
        socket.join(`chat_${employeeId}`);
    });

    socket.on('send_message', (data) => {
        const { employeeId, message } = data;
        io.to(`chat_${employeeId}`).emit('receive_message', message);
    });

    socket.on('disconnect', () => {
        console.log(`❌ Socket disconnected: ${socket.id}`);
    });
});

// Start — Connect to MySQL then sync all tables, then start server
const start = async () => {
    try {
        await connectDB();

        // sync({ alter: true }) creates/updates tables automatically
        await sequelize.sync({ alter: true });
        console.log('✅ All MySQL tables synced');

        initGemini();

        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
            console.log(`\n🚀 WorkspaceAI Server running on port ${PORT}`);
            console.log(`📡 MySQL (XAMPP) — 13 API route groups loaded`);
            console.log(`💬 Socket.IO ready for real-time chat\n`);
        });
    } catch (error) {
        console.error('❌ Server start failed:', error);
    }
};

start();