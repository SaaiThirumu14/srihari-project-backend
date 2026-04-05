const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Attendance = sequelize.define('Attendance', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    employeeId: { type: DataTypes.INTEGER, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    checkIn: { type: DataTypes.DATE },
    checkOut: { type: DataTypes.DATE },
    status: {
        type: DataTypes.ENUM('Present', 'Absent', 'Late', 'On Leave'),
        defaultValue: 'Absent'
    },
    location: { type: DataTypes.STRING },
    device: { type: DataTypes.STRING },
    anomalyDetected: { type: DataTypes.BOOLEAN, defaultValue: false },
    anomalyReason: { type: DataTypes.STRING }
}, { timestamps: true });

Attendance.belongsTo(User, { as: 'employee', foreignKey: 'employeeId' });

module.exports = Attendance;
