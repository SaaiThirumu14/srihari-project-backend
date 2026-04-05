const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PromotionAlert = sequelize.define('PromotionAlert', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    employee: { type: DataTypes.INTEGER, allowNull: false },
    triggeredBy: { type: DataTypes.INTEGER, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.ENUM('Alert', 'PromotionOffer'), defaultValue: 'Alert' },
    status: { type: DataTypes.ENUM('Unread', 'Read', 'Accepted', 'Rejected'), defaultValue: 'Unread' }
}, { timestamps: true });

module.exports = PromotionAlert;
