const Survey = require('../models/Survey');
const AttritionPrediction = require('../models/AttritionPrediction');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const User = require('../models/User');
const { runEnsemble } = require('../ai/ensembleEngine');
const { chatWithAI, predictAbsenteeism, forecastWorkforce } = require('../services/geminiService');

const runPrediction = async (req, res) => {
    try {
        const survey = await Survey.findById(req.params.surveyId);
        if (!survey) return res.status(404).json({ message: 'Survey not found' });

        const surveyData = {
            responses: survey.responses.toObject ? survey.responses.toObject() : survey.responses,
            age: survey.age, gender: survey.gender, department: survey.department,
            yearsAtCompany: survey.yearsAtCompany, employeeId: survey.employeeId,
            employeeName: survey.employeeName
        };

        const aiResults = await runEnsemble(surveyData, Survey);

        const prediction = await AttritionPrediction.findOneAndUpdate(
            { surveyId: survey._id },
            { surveyId: survey._id, employeeId: survey.employeeId, employeeName: survey.employeeName, department: survey.department, ...aiResults },
            { upsert: true, new: true }
        );

        res.json({ message: 'Prediction generated', prediction });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getPrediction = async (req, res) => {
    try {
        const prediction = await AttritionPrediction.findOne({ surveyId: req.params.surveyId });
        if (!prediction) return res.status(404).json({ message: 'No prediction yet. Run AI first.' });
        res.json({ prediction });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAllPredictions = async (req, res) => {
    try {
        const predictions = await AttritionPrediction.find({}).sort({ createdAt: -1 });
        res.json({ predictions });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateDecision = async (req, res) => {
    try {
        const { hrDecision, hrNotes } = req.body;
        const prediction = await AttritionPrediction.findOneAndUpdate(
            { surveyId: req.params.surveyId },
            { hrDecision, hrNotes, decidedAt: new Date() },
            { new: true }
        );
        if (!prediction) return res.status(404).json({ message: 'Prediction not found' });
        res.json({ message: 'Decision updated', prediction });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getRetention = async (req, res) => {
    try {
        const prediction = await AttritionPrediction.findOne({ surveyId: req.params.surveyId });
        if (!prediction) return res.status(404).json({ message: 'No prediction available' });
        res.json({
            retentionStrategies: prediction.retentionStrategies, riskLevel: prediction.riskLevel,
            prediction: prediction.prediction, employeeName: prediction.employeeName,
            keyRiskFactors: prediction.keyRiskFactors, geminiInsight: prediction.geminiInsight
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getStats = async (req, res) => {
    try {
        const predictions = await AttritionPrediction.find({});
        const total = predictions.length;
        const stay = predictions.filter(p => p.prediction === 'Stay').length;
        const atRisk = predictions.filter(p => p.prediction === 'At Risk').length;
        const leave = predictions.filter(p => p.prediction === 'Leave').length;
        const avgScore = total > 0 ? Math.round(predictions.reduce((s, p) => s + p.ensembleScore, 0) / total) : 0;
        res.json({ total, stay, atRisk, leave, avgScore });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const aiChat = async (req, res) => {
    try {
        const { query } = req.body;
        const response = await chatWithAI(query, { role: req.user.role, department: req.user.department });
        res.json({ response });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const aiAbsenteeism = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const user = await User.findById(employeeId);
        if (!user) return res.status(404).json({ message: 'Employee not found' });
        const attendance = await Attendance.find({ employeeId }).sort({ date: -1 }).limit(30);
        const leaves = await Leave.find({ employeeId }).sort({ appliedAt: -1 }).limit(10);
        const result = await predictAbsenteeism(attendance, leaves, user.name);
        res.json({ employeeId, employeeName: user.name, ...result });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const aiForecast = async (req, res) => {
    try {
        const { department } = req.query;
        const result = await forecastWorkforce(department || 'All');
        res.json({ department: department || 'All', ...result });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const simulateScenario = async (req, res) => {
    try {
        const { surveyId, salaryAdjustment, stressReduction } = req.body;
        const survey = await Survey.findById(surveyId);
        if (!survey) return res.status(404).json({ message: 'Survey not found.' });

        // Clone and tweak survey data for simulation
        const simulatedData = { ...survey.toObject() };
        if (salaryAdjustment) simulatedData.responses.compensationSatisfaction = Math.min(10, simulatedData.responses.compensationSatisfaction + salaryAdjustment);
        if (stressReduction) simulatedData.responses.stressLevel = Math.max(1, simulatedData.responses.stressLevel - stressReduction);

        const aiResults = await runEnsemble(simulatedData, Survey);

        // Update the prediction record with last simulation
        await AttritionPrediction.findOneAndUpdate(
            { surveyId },
            { 
                lastSimulation: {
                    scenario: `Salary +${salaryAdjustment || 0}, Stress -${stressReduction || 0}`,
                    newRiskScore: aiResults.ensembleScore,
                    improvement: (survey.ensembleScore || 0) - aiResults.ensembleScore
                }
            }
        );

        res.json({ 
            message: 'Simulation Complete', 
            originalScore: survey.ensembleScore || 0,
            simulatedScore: aiResults.ensembleScore,
            riskReduction: (survey.ensembleScore || 0) - aiResults.ensembleScore,
            recommendation: aiResults.geminiInsight 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getHeatmap = async (req, res) => {
    try {
        const heatmap = await AttritionPrediction.aggregate([
            {
                $group: {
                    _id: "$department",
                    avgRisk: { $avg: "$ensembleScore" },
                    totalEmployees: { $sum: 1 },
                    highRiskCount: { $sum: { $cond: [{ $eq: ["$riskLevel", "High"] }, 1, 0] } },
                    totalCost: { $sum: "$attritionCost" }
                }
            },
            { $sort: { avgRisk: -1 } }
        ]);
        res.json({ heatmap });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { runPrediction, getPrediction, getAllPredictions, updateDecision, getRetention, getStats, aiChat, aiAbsenteeism, aiForecast, simulateScenario, getHeatmap };
