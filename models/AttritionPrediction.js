const mongoose = require('mongoose');

const attritionPredictionSchema = new mongoose.Schema({
    surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true, unique: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employeeName: { type: String },
    department: { type: String },

    // Individual model scores (0-100)
    lightgbmScore: { type: Number },
    catboostScore: { type: Number },
    bertSentimentScore: { type: Number },
    gnnScore: { type: Number },

    // Ensemble
    ensembleScore: { type: Number },
    prediction: {
        type: String,
        enum: ['Stay', 'At Risk', 'Leave'],
        required: true
    },
    riskLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        required: true
    },

    // Strategic Metrics (AI Decision Support)
    confidenceScore: { type: Number }, // Overall model confidence (0-100)
    riskStability: { type: String, enum: ['Stable', 'Improving', 'Declining'], default: 'Stable' },
    attritionCost: { type: Number }, // Estimated business impact (currency)

    // AI-generated insights (Gemini 2.5)
    retentionStrategies: [{ type: String }],
    geminiInsight: { type: String },
    exitWindow: {
        timeline: { type: String },
        confidence: { type: Number },
        factors: [{ type: String }]
    },
    keyRiskFactors: [{ type: String }],
    
    // Simulations
    lastSimulation: {
        scenario: { type: String },
        newRiskScore: { type: Number },
        improvement: { type: Number }
    },

    // HR Decision
    hrDecision: {
        type: String,
        enum: ['Stay', 'Leave', 'Under Review', 'Pending'],
        default: 'Pending'
    },
    hrNotes: { type: String },
    decidedAt: { type: Date },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AttritionPrediction', attritionPredictionSchema);
