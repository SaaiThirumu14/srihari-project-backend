const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Survey = sequelize.define('Survey', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    employeeId: { type: DataTypes.INTEGER, allowNull: false },
    employeeName: { type: DataTypes.STRING, allowNull: false },
    department: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: false },
    gender: { type: DataTypes.ENUM('Male', 'Female', 'Other'), allowNull: false },
    yearsAtCompany: { type: DataTypes.FLOAT, allowNull: false },
    responses: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
    additionalComments: { type: DataTypes.TEXT },
    sentimentScore: { type: DataTypes.FLOAT },
    totalScore: { type: DataTypes.FLOAT },
    percentageScore: { type: DataTypes.FLOAT },
    forwardedToHR: { type: DataTypes.BOOLEAN, defaultValue: false },
    forwardedAt: { type: DataTypes.DATE },
    forwardedBy: { type: DataTypes.INTEGER }
}, { timestamps: true });

const calcScores = (survey) => {
    const responses = survey.responses || {};
    const values = Object.values(responses).filter(v => typeof v === 'number');
    if (values.length > 0) {
        const total = values.reduce((sum, v) => sum + v, 0);
        survey.totalScore = total;
        survey.percentageScore = parseFloat(((total / (values.length * 10)) * 100).toFixed(2));
    } else {
        survey.totalScore = 0;
        survey.percentageScore = 0;
    }
};

Survey.beforeCreate(calcScores);
Survey.beforeUpdate(calcScores);

module.exports = Survey;
