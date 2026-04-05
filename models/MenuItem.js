const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MenuItem = sequelize.define('MenuItem', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    calories: { type: DataTypes.INTEGER },
    image: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    popular: { type: DataTypes.BOOLEAN, defaultValue: false },
    isSpecial: { type: DataTypes.BOOLEAN, defaultValue: false },
    available: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { timestamps: true });

module.exports = MenuItem;
