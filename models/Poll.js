const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Poll = sequelize.define('Poll', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    question: { type: DataTypes.STRING, allowNull: false },
    options: { type: DataTypes.JSON, defaultValue: [] },
    votedEmployees: { type: DataTypes.JSON, defaultValue: [] },
    status: { type: DataTypes.ENUM('Active', 'Closed'), defaultValue: 'Active' },
    endDate: { type: DataTypes.STRING }
}, { timestamps: true });

module.exports = Poll;
