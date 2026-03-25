const mongoose = require('mongoose');

const wellnessSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    stressLevel: { type: Number, min: 1, max: 5 },
    sleepQuality: { type: Number, min: 1, max: 5 },
    physicalActivity: { type: Number, min: 1, max: 5 },
    mood: { type: String, enum: ['Happy', 'Neutral', 'Sad', 'Anxious', 'Angry'] },
    hydration: { type: Number, default: 0 }, // glasses of water
    steps: { type: Number, default: 0 },
    notes: { type: String },
    sentiment: { type: String },
    confidence: { type: Number },
    geminiAdvice: { type: String },
    nutritionRecommendation: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Wellness', wellnessSchema);
