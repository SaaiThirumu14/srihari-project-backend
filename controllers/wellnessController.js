const Wellness = require('../models/Wellness');
const User = require('../models/User');
const { analyzeWellness } = require('../services/geminiService');
const GamificationService = require('../services/gamificationService');

const addWellnessEntry = async (req, res) => {
    try {
        const { stressLevel, sleepQuality, physicalActivity, mood, notes, hydration, steps } = req.body;

        let sentimentData = { sentiment: 'Neutral', confidence: 0, advice: '', nutritionRecommendation: 'Balanced meal' };
        sentimentData = await analyzeWellness(notes || 'Daily summary', mood, stressLevel);

        const entry = await Wellness.create({
            employeeId: req.user.id,
            stressLevel, sleepQuality, physicalActivity, mood, notes,
            hydration, steps,
            sentiment: sentimentData.sentiment,
            confidence: sentimentData.confidence,
            geminiAdvice: sentimentData.advice,
            nutritionRecommendation: sentimentData.nutritionRecommendation
        });

        let bonus = 10;
        if (hydration >= 8) bonus += 5;
        if (steps >= 10000) bonus += 10;

        await GamificationService.awardPoints(req.user.id, bonus, 'Wellness & Lifestyle Check-in');
        res.json({ success: true, message: `Check-in Complete! Awarded ${bonus} points.`, entry });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getAnalytics = async (req, res) => {
    try {
        const { employeeId } = req.query;
        const where = employeeId ? { employeeId } : {};
        const data = await Wellness.findAll({ 
            where,
            include: [{ model: User, as: 'employee', attributes: ['name', 'department'] }]
        });

        const analytics = {
            avgStress: data.reduce((a, b) => a + (b.stressLevel || 0), 0) / (data.length || 1),
            avgSleep: data.reduce((a, b) => a + (b.sleepQuality || 0), 0) / (data.length || 1),
            avgActivity: data.reduce((a, b) => a + (b.physicalActivity || 0), 0) / (data.length || 1),
            count: data.length
        };

        res.json({ success: true, data, analytics });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { addWellnessEntry, getAnalytics };
