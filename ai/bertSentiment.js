function bertSentimentScore(surveyData) {
    const { responses } = surveyData;
    const wellbeingGroup = [responses.mentalHealthSupport, responses.workLifeBalance, responses.workEnvironment, responses.overallHappiness];
    const socialGroup = [responses.relationshipWithTeam, responses.relationshipWithTL, responses.managerSupport, responses.inclusionAndDiversity, responses.communicationClarity];
    const growthGroup = [responses.careerGrowth, responses.learningOpportunities, responses.recognitionAndRewards];
    const pressureGroup = [responses.stressLevel, responses.workload];

    const avg = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;
    const wellbeingSentiment = avg(wellbeingGroup) / 10;
    const socialSentiment = avg(socialGroup) / 10;
    const growthSentiment = avg(growthGroup) / 10;
    const pressureSentiment = 1 - (avg(pressureGroup) / 10);

    const bertSentiment = (wellbeingSentiment * 0.30) + (socialSentiment * 0.25) + (growthSentiment * 0.25) + (pressureSentiment * 0.20);
    return Math.round(Math.max(0, Math.min(100, (1 - bertSentiment) * 100)));
}
module.exports = { bertSentimentScore };
