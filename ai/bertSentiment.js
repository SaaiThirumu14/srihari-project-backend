function bertSentimentScore(surveyData) {
    const { responses } = surveyData;
    const r = typeof responses === 'string' ? JSON.parse(responses) : (responses || {});
    
    const wellbeingGroup = [r.mentalHealthSupport || 5, r.workLifeBalance || 5, r.workEnvironment || 5, r.overallHappiness || 5];
    const socialGroup = [r.relationshipWithTeam || 5, r.relationshipWithTL || 5, r.managerSupport || 5, r.inclusionAndDiversity || 5, r.communicationClarity || 5];
    const growthGroup = [r.careerGrowth || 5, r.learningOpportunities || 5, r.recognitionAndRewards || 5];
    const pressureGroup = [r.stressLevel || 5, r.workload || 5];

    const avg = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;
    const wellbeingSentiment = avg(wellbeingGroup) / 10;
    const socialSentiment = avg(socialGroup) / 10;
    const growthSentiment = avg(growthGroup) / 10;
    const pressureSentiment = 1 - (avg(pressureGroup) / 10);

    const bertSentiment = (wellbeingSentiment * 0.30) + (socialSentiment * 0.25) + (growthSentiment * 0.25) + (pressureSentiment * 0.20);
    return Math.round(Math.max(0, Math.min(100, (1 - bertSentiment) * 100)));
}
module.exports = { bertSentimentScore };
