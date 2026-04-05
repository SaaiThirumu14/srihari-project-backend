const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AttritionPrediction = sequelize.define('AttritionPrediction', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    surveyId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    employeeId: { type: DataTypes.INTEGER, allowNull: false },
    employeeName: { type: DataTypes.STRING },
    department: { type: DataTypes.STRING },
    lightgbmScore: { type: DataTypes.FLOAT },
    catboostScore: { type: DataTypes.FLOAT },
    bertSentimentScore: { type: DataTypes.FLOAT },
    gnnScore: { type: DataTypes.FLOAT },
    ensembleScore: { type: DataTypes.FLOAT },
    prediction: { type: DataTypes.ENUM('Stay', 'At Risk', 'Leave'), allowNull: false },
    riskLevel: { type: DataTypes.ENUM('Low', 'Medium', 'High'), allowNull: false },
    confidenceScore: { type: DataTypes.FLOAT },
    riskStability: { type: DataTypes.ENUM('Stable', 'Unstable', 'Improving', 'Declining'), defaultValue: 'Stable' },
    attritionCost: { type: DataTypes.FLOAT },
    retentionStrategies: { type: DataTypes.JSON, defaultValue: [] },
    geminiInsight: { type: DataTypes.TEXT },
    exitWindow: { type: DataTypes.JSON, defaultValue: {} },
    keyRiskFactors: { type: DataTypes.JSON, defaultValue: [] },
    lastSimulation: { type: DataTypes.JSON, defaultValue: {} },
    hrDecision: { type: DataTypes.ENUM('Stay', 'Leave', 'Under Review', 'Pending'), defaultValue: 'Pending' },
    hrNotes: { type: DataTypes.TEXT },
    decidedAt: { type: DataTypes.DATE }
}, { timestamps: true });

module.exports = AttritionPrediction;
