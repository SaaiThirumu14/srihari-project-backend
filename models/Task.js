const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Task = sequelize.define('Task', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    assignedTo: { type: DataTypes.INTEGER, allowNull: false },
    assignedBy: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM('Todo', 'InProgress', 'Completed', 'Verified'), defaultValue: 'Todo' },
    difficulty: { type: DataTypes.ENUM('Easy', 'Medium', 'Hard'), defaultValue: 'Medium' },
    deadline: { type: DataTypes.DATE },
    metrics: {
        type: DataTypes.JSON,
        defaultValue: { completionAbility: 0, timeEfficiency: 0, qualityScore: 0 }
    },
    completedAt: { type: DataTypes.DATE }
}, { timestamps: true });

Task.belongsTo(User, { as: 'assignee', foreignKey: 'assignedTo' });
Task.belongsTo(User, { as: 'assigner', foreignKey: 'assignedBy' });

module.exports = Task;
