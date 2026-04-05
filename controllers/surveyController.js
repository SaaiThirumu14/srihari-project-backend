const Survey = require('../models/Survey');
const User = require('../models/User');
const GamificationService = require('../services/gamificationService');

const submitSurvey = async (req, res) => {
    try {
        const { age, gender, yearsAtCompany, responses, additionalComments } = req.body;
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const survey = await Survey.create({
            employeeId: req.user.id,
            employeeName: user.name,
            department: user.department || 'General',
            age, gender, yearsAtCompany, responses, additionalComments
        });

        await GamificationService.rewardSurvey(req.user.id);
        res.status(201).json({ message: 'Survey submitted successfully', survey });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getMySurvey = async (req, res) => {
    try {
        const survey = await Survey.findOne({
            where: { employeeId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json({ survey, submitted: !!survey });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getDepartmentSurveys = async (req, res) => {
    try {
        const { department } = req.query;
        const where = department ? { department } : {};
        const surveys = await Survey.findAll({ where, order: [['createdAt', 'DESC']] });
        res.json({ surveys });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const forwardSurvey = async (req, res) => {
    try {
        const survey = await Survey.findByPk(req.params.surveyId);
        if (!survey) return res.status(404).json({ message: 'Survey not found' });
        if (survey.forwardedToHR) return res.status(409).json({ message: 'Already forwarded' });

        survey.forwardedToHR = true;
        survey.forwardedAt = new Date();
        survey.forwardedBy = req.user.id;
        await survey.save();

        res.json({ message: 'Forwarded to HR', survey });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getHRSurveys = async (req, res) => {
    try {
        // HR can see ALL surveys to run AI predictions on any employee
        const surveys = await Survey.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json({ surveys });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAllSurveys = async (req, res) => {
    try {
        const surveys = await Survey.findAll({ order: [['createdAt', 'DESC']] });
        res.json({ surveys });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { submitSurvey, getMySurvey, getDepartmentSurveys, forwardSurvey, getHRSurveys, getAllSurveys };
