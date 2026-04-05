const { connectDB } = require('./config/db');
const Task = require('./models/Task');
const GamificationService = require('./services/gamificationService');
const fs = require('fs');

(async () => {
    await connectDB();
    try {
        const task = await Task.create({ title: 'Test Task', assignedTo: 4, assignedBy: 1, difficulty: 'Easy', status: 'InProgress' });
        const wasNotCompleted = true;
        task.status = 'Completed';
        
        if (task.status === 'Completed' && wasNotCompleted) {
            task.completedAt = new Date();
            await GamificationService.updateTaskMetrics(task.assignedTo, task.difficulty);
            await GamificationService.awardPoints(task.assignedTo, 25, 'Task Completion');
        }
        await task.save();
        fs.writeFileSync('error_log.txt', 'SUCCESS');
    } catch (err) {
        fs.writeFileSync('error_log.txt', String(err.stack || err));
    }
    process.exit(0);
})();
