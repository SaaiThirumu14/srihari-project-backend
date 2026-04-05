const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Leave = sequelize.define('Leave', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    employeeId: { type: DataTypes.INTEGER, allowNull: false },
    startDate: { type: DataTypes.DATEONLY, allowNull: false },
    endDate: { type: DataTypes.DATEONLY, allowNull: false },
    reason: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'), defaultValue: 'Pending' },
    aiRecommendation: { type: DataTypes.TEXT },
    aiConfidence: { type: DataTypes.FLOAT }
}, { timestamps: true });

Leave.belongsTo(User, { as: 'employee', foreignKey: 'employeeId' });

module.exports = Leave;
