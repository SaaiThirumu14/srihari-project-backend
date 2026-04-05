const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PointTransaction = sequelize.define('PointTransaction', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.ENUM('Credit', 'Debit'), allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: true });

module.exports = PointTransaction;
