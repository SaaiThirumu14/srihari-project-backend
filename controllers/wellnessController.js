const Wellness = require('../models/Wellness');
const { analyzeWellness } = require('../services/geminiService');
const GamificationService = require('../services/gamificationService');

const addWellnessEntry = async (req, res) => {
    try {
        const { stressLevel, sleepQuality, physicalActivity, mood, notes, hydration, steps } = req.body;

        // Gemini 2.5 AI sentiment and nutrition analysis
        let sentimentData = { sentiment: 'Neutral', confidence: 0, advice: '', nutritionRecommendation: 'Balanced meal' };
        sentimentData = await analyzeWellness(notes || 'Daily summary', mood, stressLevel);

        const entry = await Wellness.create({
            employeeId: req.user._id, stressLevel, sleepQuality, physicalActivity, mood, notes,
            hydration, steps,
            sentiment: sentimentData.sentiment, confidence: sentimentData.confidence,
            geminiAdvice: sentimentData.advice,
            nutritionRecommendation: sentimentData.nutritionRecommendation
        });

        // Rewards for healthy stats
        let bonus = 10; // Base points
        if (hydration >= 8) bonus += 5; // Hydration goal
        if (steps >= 10000) bonus += 10; // Fitness goal
        
        await GamificationService.awardPoints(req.user._id, bonus, 'Wellness & Lifestyle Check-in');

        res.json({ success: true, message: `Check-in Complete! Awarded ${bonus} points.`, entry });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getAnalytics = async (req, res) => {
    try {
        const { employeeId } = req.query;
        const filter = employeeId ? { employeeId } : {};
        const data = await Wellness.find(filter).populate('employeeId', 'name email department');

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
