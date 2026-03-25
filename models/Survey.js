const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employeeName: { type: String, required: true },
    department: { type: String, required: true },

    // Basic Info
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    yearsAtCompany: { type: Number, required: true },

    // 18 Survey Questions (rated 1-10)
    responses: {
        workLifeBalance: { type: Number, min: 1, max: 10, required: true },
        jobSatisfaction: { type: Number, min: 1, max: 10, required: true },
        stressLevel: { type: Number, min: 1, max: 10, required: true },
        relationshipWithTeam: { type: Number, min: 1, max: 10, required: true },
        relationshipWithTL: { type: Number, min: 1, max: 10, required: true },
        managerSupport: { type: Number, min: 1, max: 10, required: true },
        careerGrowth: { type: Number, min: 1, max: 10, required: true },
        compensationSatisfaction: { type: Number, min: 1, max: 10, required: true },
        workload: { type: Number, min: 1, max: 10, required: true },
        recognitionAndRewards: { type: Number, min: 1, max: 10, required: true },
        companyLoyalty: { type: Number, min: 1, max: 10, required: true },
        mentalHealthSupport: { type: Number, min: 1, max: 10, required: true },
        remoteWorkFlexibility: { type: Number, min: 1, max: 10, required: true },
        learningOpportunities: { type: Number, min: 1, max: 10, required: true },
        communicationClarity: { type: Number, min: 1, max: 10, required: true },
        inclusionAndDiversity: { type: Number, min: 1, max: 10, required: true },
        workEnvironment: { type: Number, min: 1, max: 10, required: true },
        overallHappiness: { type: Number, min: 1, max: 10, required: true }
    },

    // NLP Analysis Support
    additionalComments: { type: String },
    sentimentScore: { type: Number }, // Derived from comments via BERT/Gemini

    // Computed score
    totalScore: { type: Number },
    percentageScore: { type: Number },

    // Flow tracking
    forwardedToHR: { type: Boolean, default: false },
    forwardedAt: { type: Date },
    forwardedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    submittedAt: { type: Date, default: Date.now }
});

// Auto-calculate total and percentage before save
surveySchema.pre('save', function () {
    const responses = this.responses;
    const responseObj = typeof responses.toObject === 'function' ? responses.toObject() : responses;
    const values = Object.values(responseObj).filter(v => typeof v === 'number');

    if (values.length > 0) {
        const total = values.reduce((sum, v) => sum + v, 0);
        this.totalScore = total;
        this.percentageScore = parseFloat(((total / (values.length * 10)) * 100).toFixed(2));
    } else {
        this.totalScore = 0;
        this.percentageScore = 0;
    }
});

module.exports = mongoose.model('Survey', surveySchema);
