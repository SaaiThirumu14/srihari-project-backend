const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Shoutout = sequelize.define('Shoutout', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    fromUserId: { type: DataTypes.INTEGER, allowNull: false },
    fromUserName: { type: DataTypes.STRING, allowNull: false },
    toUserId: { type: DataTypes.INTEGER, allowNull: false },
    toUserName: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    pointsGiven: { type: DataTypes.INTEGER, defaultValue: 5 }
}, { timestamps: true });

module.exports = Shoutout;
