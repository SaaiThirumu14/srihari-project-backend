const Task = require('../models/Task');
const GamificationService = require('../services/gamificationService');

const createTask = async (req, res) => {
    const { title, description, assignedTo, difficulty, deadline } = req.body;
    try {
        const task = await Task.create({ title, description, assignedTo, assignedBy: req.user._id, difficulty, deadline });
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getTasks = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Employee') query.assignedTo = req.user._id;
        else if (req.user.role === 'TeamLeader') query.assignedBy = req.user._id;
        const tasks = await Task.find(query).populate('assignedTo', 'name email').populate('assignedBy', 'name');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateTaskStatus = async (req, res) => {
    const { status, metrics } = req.body;
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const wasNotCompleted = task.status !== 'Completed';
        task.status = status || task.status;
        if (metrics) task.metrics = { ...task.metrics, ...metrics };

        if (status === 'Completed' && wasNotCompleted) {
            task.completedAt = Date.now();
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
