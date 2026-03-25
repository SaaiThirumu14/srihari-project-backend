const Survey = require('../models/Survey');
const User = require('../models/User');
const GamificationService = require('../services/gamificationService');

const submitSurvey = async (req, res) => {
    try {
        const { age, gender, yearsAtCompany, responses, additionalComments } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const survey = await Survey.create({
            employeeId: req.user._id, employeeName: user.name, department: user.department || 'General',
            age, gender, yearsAtCompany, responses, additionalComments
        });

        // Track only for gamification, no longer blocks retake
        await GamificationService.rewardSurvey(req.user._id);

        res.status(201).json({ message: 'Survey submitted successfully', survey });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getMySurvey = async (req, res) => {
    try {
        const survey = await Survey.findOne({ employeeId: req.user._id }).sort({ submittedAt: -1 });
        res.json({ survey, submitted: !!survey });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getDepartmentSurveys = async (req, res) => {
    try {
        const { department } = req.query;
        const filter = department ? { department } : {};
        const surveys = await Survey.find(filter).sort({ submittedAt: -1 });
        res.json({ surveys });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const forwardSurvey = async (req, res) => {
    try {
        const survey = await Survey.findById(req.params.surveyId);
        if (!survey) return res.status(404).json({ message: 'Survey not found' });
        if (survey.forwardedToHR) return res.status(409).json({ message: 'Already forwarded' });

        survey.forwardedToHR = true;
        survey.forwardedAt = new Date();
        survey.forwardedBy = req.user._id;
        await survey.save();

        res.json({ message: 'Forwarded to HR', survey });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getHRSurveys = async (req, res) => {
    try {
        const surveys = await Survey.find({ forwardedToHR: true }).sort({ forwardedAt: -1 });
        res.json({ surveys });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAllSurveys = async (req, res) => {
    try {
        const surveys = await Survey.find({}).sort({ submittedAt: -1 });
        res.json({ surveys });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { submitSurvey, getMySurvey, getDepartmentSurveys, forwardSurvey, getHRSurveys, getAllSurveys };
