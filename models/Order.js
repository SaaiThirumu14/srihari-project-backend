const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    userName: { type: DataTypes.STRING, allowNull: false },
    items: { type: DataTypes.JSON, defaultValue: [] },
    totalPrice: { type: DataTypes.FLOAT, allowNull: false },
    deliveryTime: { type: DataTypes.STRING, allowNull: false },
    deliveryLocation: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.ENUM('Pending', 'Preparing', 'Ready', 'Delivered'), defaultValue: 'Pending' },
    estimatedReadyTime: { type: DataTypes.STRING },
    rating: { type: DataTypes.INTEGER },
    feedback: { type: DataTypes.TEXT }
}, { timestamps: true });

module.exports = Order;
