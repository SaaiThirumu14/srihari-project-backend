const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Wellness = sequelize.define('Wellness', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    employeeId: { type: DataTypes.INTEGER, allowNull: false },
    stressLevel: { type: DataTypes.INTEGER },
    sleepQuality: { type: DataTypes.INTEGER },
    physicalActivity: { type: DataTypes.INTEGER },
    mood: { type: DataTypes.ENUM('Happy', 'Neutral', 'Sad', 'Anxious', 'Angry') },
    hydration: { type: DataTypes.INTEGER, defaultValue: 0 },
    steps: { type: DataTypes.INTEGER, defaultValue: 0 },
    notes: { type: DataTypes.TEXT },
    sentiment: { type: DataTypes.STRING },
    confidence: { type: DataTypes.FLOAT },
    geminiAdvice: { type: DataTypes.TEXT },
    nutritionRecommendation: { type: DataTypes.TEXT }
}, { timestamps: true });

const User = require('./User');
Wellness.belongsTo(User, { as: 'employee', foreignKey: 'employeeId' });

module.exports = Wellness;
