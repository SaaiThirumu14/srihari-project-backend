async function gnnScore(surveyData, Survey) {
    const { responses, department, employeeId } = surveyData;
    try {
        const peerSurveys = await Survey.find({ department, employeeId: { $ne: employeeId } }).limit(20);
        let departmentAvgRisk = 0;

        if (peerSurveys.length > 0) {
            const peerScores = peerSurveys.map(s => {
                const r = s.responses;
                return (r.jobSatisfaction + r.companyLoyalty + r.overallHappiness) / 30;
            });
            const avgPeerSatisfaction = peerScores.reduce((a, b) => a + b, 0) / peerScores.length;
            departmentAvgRisk = (1 - avgPeerSatisfaction) * 100;
        }

        const r = responses;
        const individualScore = (r.relationshipWithTeam / 10) * 0.35 + (r.relationshipWithTL / 10) * 0.30 +
            (r.inclusionAndDiversity / 10) * 0.20 + (r.communicationClarity / 10) * 0.15;
        const individualRisk = (1 - individualScore) * 100;
        const gnnRisk = (individualRisk * 0.6) + (departmentAvgRisk * 0.4);
        return Math.round(Math.max(0, Math.min(100, gnnRisk)));
    } catch {
        const r = responses;
        const score = (r.relationshipWithTeam + r.relationshipWithTL + r.inclusionAndDiversity) / 30;
        return Math.round((1 - score) * 100);
    }
}
module.exports = { gnnScore };
