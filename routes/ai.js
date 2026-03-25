const express = require('express');
const router = express.Router();
const { runPrediction, getPrediction, getAllPredictions, updateDecision, getRetention, getStats, aiChat, aiAbsenteeism, aiForecast, simulateScenario, getHeatmap } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Churn AI
router.post('/predict/:surveyId', protect, authorize('HR', 'Admin'), runPrediction);
router.get('/prediction/:surveyId', protect, authorize('HR', 'Admin'), getPrediction);
router.get('/predictions/all', protect, authorize('HR', 'Admin'), getAllPredictions);
router.put('/decision/:surveyId', protect, authorize('HR', 'Admin'), updateDecision);
router.get('/retention/:surveyId', protect, authorize('HR', 'Admin'), getRetention);
router.get('/stats', protect, authorize('HR', 'Admin'), getStats);
router.post('/simulate', protect, authorize('HR', 'Admin'), simulateScenario);
router.get('/heatmap', protect, authorize('HR', 'Admin'), getHeatmap);

// Gemini AI features
router.post('/chat', protect, aiChat);
router.get('/absenteeism/:employeeId', protect, authorize('HR', 'Admin', 'TeamLeader'), aiAbsenteeism);
router.get('/forecast', protect, authorize('HR', 'Admin', 'TeamLeader'), aiForecast);

module.exports = router;
