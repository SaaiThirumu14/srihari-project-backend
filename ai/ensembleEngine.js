const { lightgbmScore } = require('./lightgbmScorer');
const { catboostScore } = require('./catboostScorer');
const { bertSentimentScore } = require('./bertSentiment');
const { gnnScore } = require('./gnnRelationship');
const { generateRetentionInsight } = require('../services/geminiService');

const WEIGHTS = { lightgbm: 0.30, catboost: 0.25, bert: 0.25, gnn: 0.20 };

function getPrediction(score) {
    if (score <= 35) return { prediction: 'Stay', riskLevel: 'Low' };
    if (score <= 65) return { prediction: 'At Risk', riskLevel: 'Medium' };
    return { prediction: 'Leave', riskLevel: 'High' };
}

function generateRetentionStrategies(prediction, responses) {
    const strategies = [];
    const r = responses;
    if (prediction === 'Leave' || prediction === 'At Risk') {
        if (r.compensationSatisfaction < 5) strategies.push('💰 Conduct immediate compensation review and benchmarking');
        if (r.careerGrowth < 5) strategies.push('📈 Create personalized career growth roadmap with quarterly milestones');
        if (r.stressLevel > 7) strategies.push('🧘 Implement stress reduction: flexible hours, meditation, workload redistribution');
        if (r.workLifeBalance < 5) strategies.push('⚖️ Enforce work-life balance policies including mandatory off-hours');
        if (r.relationshipWithTL < 5) strategies.push('🤝 Schedule bi-weekly 1:1 mentoring with team leader');
        if (r.managerSupport < 5) strategies.push('🎯 Enroll manager in empathetic leadership training');
        if (r.recognitionAndRewards < 5) strategies.push('🏆 Introduce peer recognition program with monthly spotlight');
        if (r.learningOpportunities < 5) strategies.push('📚 Provide premium learning platform access and conference sponsorships');
        if (r.remoteWorkFlexibility < 5) strategies.push('🏠 Offer hybrid work arrangement (3 WFH days/week)');
        if (r.mentalHealthSupport < 5) strategies.push('💚 Partner with EAP for free counseling services');
    }
    if (strategies.length === 0) {
        strategies.push('✅ High retention probability — continue current engagement');
        strategies.push('🌟 Consider for leadership development or mentorship role');
        strategies.push('📊 Schedule quarterly check-ins to maintain satisfaction');
    }
    return strategies.slice(0, 6);
}

function generateExitWindow(ensembleScore, yearsAtCompany, responses) {
    const r = responses;
    const factors = [];
    if (ensembleScore <= 35) {
        return { timeline: 'Not Expected (12+ months)', confidence: Math.round(85 + Math.random() * 10), factors: ['High job satisfaction', 'Strong loyalty', 'Positive relationships'] };
    }
    if (r.compensationSatisfaction < 4) factors.push('Below-market compensation');
    if (r.careerGrowth < 4) factors.push('Limited career advancement');
    if (r.stressLevel > 7) factors.push('Chronic high stress');
    if (r.overallHappiness < 4) factors.push('Overall disengagement');
    if (yearsAtCompany < 2) factors.push('Early tenure — exploration mindset');

    const confidence = Math.round(60 + ensembleScore * 0.25);
    if (ensembleScore > 75) return { timeline: '0–3 months (Imminent)', confidence: Math.min(confidence, 92), factors };
    if (ensembleScore > 60) return { timeline: '3–6 months (High Risk)', confidence: Math.min(confidence, 85), factors };
    return { timeline: '6–12 months (Moderate Risk)', confidence: Math.min(confidence, 78), factors };
}

function identifyKeyRiskFactors(responses) {
    const r = responses;
    const risks = [];
    if (r.jobSatisfaction < 5) risks.push('Low job satisfaction');
    if (r.stressLevel > 7) risks.push('High stress levels');
    if (r.careerGrowth < 5) risks.push('Poor career growth prospects');
    if (r.compensationSatisfaction < 5) risks.push('Inadequate compensation');
    if (r.workLifeBalance < 5) risks.push('Poor work-life balance');
    if (r.managerSupport < 5) risks.push('Insufficient manager support');
    if (r.companyLoyalty < 5) risks.push('Low company loyalty');
    if (r.overallHappiness < 5) risks.push('Low overall happiness');
    return risks.slice(0, 5);
}

async function runEnsemble(surveyData, SurveyModel) {
    const lgbm = lightgbmScore(surveyData);
    const cat = catboostScore(surveyData);
    const bert = bertSentimentScore(surveyData);
    const gnn = await gnnScore(surveyData, SurveyModel);

    // Multi-Model Consensus AI (Weighted Average)
    const ensemble = Math.round(
        lgbm * WEIGHTS.lightgbm + cat * WEIGHTS.catboost + bert * WEIGHTS.bert + gnn * WEIGHTS.gnn
    );

    // Confidence Score Calculation (Inversely proportional to standard deviation)
    const scores = [lgbm, cat, bert, gnn];
    const avg = scores.reduce((a, b) => a + b) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / scores.length;
    const confidenceScore = Math.max(0, 100 - Math.sqrt(variance) * 2).toFixed(1);

    const { prediction, riskLevel } = getPrediction(ensemble);
    const retentionStrategies = generateRetentionStrategies(prediction, surveyData.responses);
    const exitWindow = generateExitWindow(ensemble, surveyData.yearsAtCompany, surveyData.responses);
    const keyRiskFactors = identifyKeyRiskFactors(surveyData.responses);

    // Business Impact (Attrition Cost Estimator)
    // Assume average employee replacement cost is 6 months salary (~3,00,000 for average SME)
    const attritionCost = prediction !== 'Stay' ? (ensemble * 5000) : 0; 

    // Risk Stability Indicator (comparing models consensus)
    const riskStability = Math.sqrt(variance) < 15 ? 'Stable' : 'Unstable';

    // Enhance with Gemini 2.5
    const result = { 
        lightgbmScore: lgbm, catboostScore: cat, bertSentimentScore: bert, gnnScore: gnn, 
        ensembleScore: ensemble, 
        confidenceScore: Number(confidenceScore),
        riskStability,
        attritionCost,
        prediction, riskLevel, retentionStrategies, exitWindow, keyRiskFactors 
    };
    
    const geminiInsight = await generateRetentionInsight(surveyData, result);
    return { ...result, geminiInsight };
}

module.exports = { runEnsemble };
