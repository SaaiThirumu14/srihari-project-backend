const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const FoodSuggestion = sequelize.define('FoodSuggestion', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    employeeId: { type: DataTypes.INTEGER, allowNull: false },
    employeeName: { type: DataTypes.STRING, allowNull: false },
    foodName: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'), defaultValue: 'Pending' }
}, { timestamps: true });

module.exports = FoodSuggestion;
