const Task = require('../models/Task');
const User = require('../models/User');
const GamificationService = require('../services/gamificationService');

const createTask = async (req, res) => {
    const { title, description, assignedTo, difficulty, deadline } = req.body;
    try {
        const task = await Task.create({ title, description, assignedTo, assignedBy: req.user.id, difficulty, deadline });
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getTasks = async (req, res) => {
    try {
        const where = {};
        if (req.user.role === 'Employee') where.assignedTo = req.user.id;
        else if (req.user.role === 'TeamLeader') where.assignedBy = req.user.id;

        const tasks = await Task.findAll({
            where,
            include: [
                { model: User, as: 'assignee', attributes: ['name', 'email'] },
                { model: User, as: 'assigner', attributes: ['name'] }
            ]
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateTaskStatus = async (req, res) => {
    const { status, metrics } = req.body;
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const wasNotCompleted = task.status !== 'Completed';
        task.status = status || task.status;
        if (metrics) task.metrics = { ...task.metrics, ...metrics };

        if (status === 'Completed' && wasNotCompleted) {
            task.completedAt = new Date();
            await GamificationService.updateTaskMetrics(task.assignedTo, task.difficulty);
            await GamificationService.awardPoints(task.assignedTo, 25, 'Task Completion');
        }

        await task.save();
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createTask, getTasks, updateTaskStatus };
