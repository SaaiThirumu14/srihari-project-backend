const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'unique_user_email',
        validate: { isEmail: true }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('Admin', 'HR', 'TeamLeader', 'Employee', 'Chef'),
        defaultValue: 'Employee'
    },
    department: { type: DataTypes.STRING },
    designation: { type: DataTypes.STRING },
    employeeId: { type: DataTypes.STRING, unique: 'unique_user_employeeId' },
    deptId: { type: DataTypes.STRING },
    skills: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    
    // Gamification
    points: { type: DataTypes.INTEGER, defaultValue: 0 },
    demerits: { type: DataTypes.INTEGER, defaultValue: 0 },
    badges: { type: DataTypes.JSON, defaultValue: [] },

    // Performance (Nested object stored as JSON)
    performance: {
        type: DataTypes.JSON,
        defaultValue: {
            workCapability: 0,
            timeManagement: 0,
            problemSolving: 0,
            overallScore: 0
        }
    },

    // Preferences (Cafeteria)
    preferences: {
        type: DataTypes.JSON,
        defaultValue: {
            diet: 'Non-Veg',
            allergies: [],
            favoriteCuisine: ''
        }
    },

    // Wellness & Promotion
    mood: { type: DataTypes.STRING, defaultValue: 'Neutral' },
    promotionStatus: {
        type: DataTypes.ENUM('None', 'Eligible', 'Pending', 'Promoted'),
        defaultValue: 'None'
    },
    promotedAt: { type: DataTypes.DATE },

    // Survey (Churn)
    surveySubmitted: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: false 
    },

    // Attendance (Array of numbers)
    faceEmbedding: { 
        type: DataTypes.JSON, 
        defaultValue: [] 
    }
}, {
    timestamps: true // adds createdAt and updatedAt
});

module.exports = User;
