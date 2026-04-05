const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Inventory = sequelize.define('Inventory', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    quantity: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    unit: { type: DataTypes.STRING, allowNull: false, defaultValue: 'units' },
    threshold: { type: DataTypes.FLOAT, defaultValue: 10 },
    category: {
        type: DataTypes.ENUM('Produce', 'Grains', 'Meat', 'Dairy', 'Spices', 'Other'),
        defaultValue: 'Other'
    },
    lastUpdated: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { timestamps: true });

module.exports = Inventory;
