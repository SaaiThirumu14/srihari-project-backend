const Survey = require('../models/Survey');
const AttritionPrediction = require('../models/AttritionPrediction');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const User = require('../models/User');
const { sequelize } = require('../config/db');
const { runEnsemble } = require('../ai/ensembleEngine');
const { chatWithAI, predictAbsenteeism, forecastWorkforce } = require('../services/geminiService');

const runPrediction = async (req, res) => {
    try {
        const survey = await Survey.findByPk(req.params.surveyId);
        if (!survey) return res.status(404).json({ message: 'Survey not found' });

        const surveyData = {
            responses: survey.responses,
            age: survey.age, gender: survey.gender, department: survey.department,
            yearsAtCompany: survey.yearsAtCompany, employeeId: survey.employeeId,
            employeeName: survey.employeeName
        };

        const aiResults = await runEnsemble(surveyData, Survey);

        let prediction = await AttritionPrediction.findOne({ where: { surveyId: survey.id } });
        if (prediction) {
            await prediction.update({ employeeId: survey.employeeId, employeeName: survey.employeeName, department: survey.department, ...aiResults });
        } else {
            prediction = await AttritionPrediction.create({ surveyId: survey.id, employeeId: survey.employeeId, employeeName: survey.employeeName, department: survey.department, ...aiResults });
        }

        res.json({ message: 'Prediction generated', prediction });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getPrediction = async (req, res) => {
    try {
        const prediction = await AttritionPrediction.findOne({ where: { surveyId: req.params.surveyId } });
        if (!prediction) return res.status(404).json({ message: 'No prediction yet. Run AI first.' });
        res.json({ prediction });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAllPredictions = async (req, res) => {
    try {
        const predictions = await AttritionPrediction.findAll({ order: [['createdAt', 'DESC']] });
        res.json({ predictions });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateDecision = async (req, res) => {
    try {
        const { hrDecision, hrNotes } = req.body;
        const prediction = await AttritionPrediction.findOne({ where: { surveyId: req.params.surveyId } });
        if (!prediction) return res.status(404).json({ message: 'Prediction not found' });
        await prediction.update({ hrDecision, hrNotes, decidedAt: new Date() });
        res.json({ message: 'Decision updated', prediction });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getRetention = async (req, res) => {
    try {
        const prediction = await AttritionPrediction.findOne({ where: { surveyId: req.params.surveyId } });
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
        const predictions = await AttritionPrediction.findAll();
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
        const user = await User.findByPk(employeeId);
        if (!user) return res.status(404).json({ message: 'Employee not found' });
        const attendance = await Attendance.findAll({ where: { employeeId }, order: [['date', 'DESC']], limit: 30 });
        const leaves = await Leave.findAll({ where: { employeeId }, order: [['createdAt', 'DESC']], limit: 10 });
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
        const survey = await Survey.findByPk(surveyId);
        if (!survey) return res.status(404).json({ message: 'Survey not found.' });

        const simulatedData = { ...survey.toJSON() };
        if (salaryAdjustment) simulatedData.responses.compensationSatisfaction = Math.min(10, simulatedData.responses.compensationSatisfaction + salaryAdjustment);
        if (stressReduction) simulatedData.responses.stressLevel = Math.max(1, simulatedData.responses.stressLevel - stressReduction);

        const aiResults = await runEnsemble(simulatedData, Survey);

        const prediction = await AttritionPrediction.findOne({ where: { surveyId } });
        if (prediction) {
            await prediction.update({
                lastSimulation: {
                    scenario: `Salary +${salaryAdjustment || 0}, Stress -${stressReduction || 0}`,
                    newRiskScore: aiResults.ensembleScore,
                    improvement: (prediction.ensembleScore || 0) - aiResults.ensembleScore
                }
            });
        }

        res.json({
            message: 'Simulation Complete',
            originalScore: prediction ? prediction.ensembleScore : 0,
            simulatedScore: aiResults.ensembleScore,
            riskReduction: (prediction ? prediction.ensembleScore : 0) - aiResults.ensembleScore,
            recommendation: aiResults.geminiInsight
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getHeatmap = async (req, res) => {
    try {
        const [heatmap] = await sequelize.query(`
            SELECT 
                department AS id,
                AVG(ensembleScore) AS avgRisk,
                COUNT(*) AS totalEmployees,
                SUM(CASE WHEN riskLevel = 'High' THEN 1 ELSE 0 END) AS highRiskCount,
                SUM(attritionCost) AS totalCost
            FROM AttritionPredictions
            GROUP BY department
            ORDER BY avgRisk DESC
        `);
        res.json({ heatmap });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { runPrediction, getPrediction, getAllPredictions, updateDecision, getRetention, getStats, aiChat, aiAbsenteeism, aiForecast, simulateScenario, getHeatmap };
