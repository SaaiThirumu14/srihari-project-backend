const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['Admin', 'HR', 'TeamLeader', 'Employee', 'Chef'],
        default: 'Employee'
    },
    department: { type: String },
    designation: { type: String },
    employeeId: { type: String, unique: true, sparse: true },
    deptId: { type: String },
    skills: [{ type: String }],

    // Gamification
    points: { type: Number, default: 0 },
    demerits: { type: Number, default: 0 },
    badges: [{ type: String }],

    // Performance
    performance: {
        workCapability: { type: Number, default: 0 },
        timeManagement: { type: Number, default: 0 },
        problemSolving: { type: Number, default: 0 },
        overallScore: { type: Number, default: 0 }
    },

    // Preferences (Cafeteria)
    preferences: {
        diet: { type: String, default: 'Non-Veg' },
        allergies: [String],
        favoriteCuisine: { type: String }
    },

    // Wellness & Promotion
    mood: { type: String, default: 'Neutral' },
    promotionStatus: {
        type: String,
        enum: ['None', 'Eligible', 'Pending', 'Promoted'],
        default: 'None'
    },
    promotedAt: { type: Date },

    // Survey (Churn)
    surveySubmitted: { type: Boolean, default: false },

    // Attendance
    faceEmbedding: { type: [Number], default: [] },

    joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
