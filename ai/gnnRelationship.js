const { Op } = require('sequelize');

async function gnnScore(surveyData, Survey) {
    const { responses, department, employeeId } = surveyData;
    try {
        const peerSurveys = await Survey.findAll({ 
            where: { 
                department, 
                employeeId: { [Op.ne]: employeeId } 
            }, 
            limit: 20 
        });
        let departmentAvgRisk = 0;

        if (peerSurveys.length > 0) {
            const peerScores = peerSurveys.map(s => {
                let r = s.responses;
                if (typeof r === 'string') {
                    try { r = JSON.parse(r); } catch { r = {}; }
                }
                if (!r) r = {};
                
                return ((r.jobSatisfaction || 5) + (r.companyLoyalty || 5) + (r.overallHappiness || 5)) / 30;
            });
            const avgPeerSatisfaction = peerScores.reduce((a, b) => a + b, 0) / peerScores.length;
            departmentAvgRisk = (1 - avgPeerSatisfaction) * 100;
        }

        const r = typeof responses === 'string' ? JSON.parse(responses) : (responses || {});
        const individualScore = ((r.relationshipWithTeam || 5) / 10) * 0.35 + ((r.relationshipWithTL || 5) / 10) * 0.30 +
            ((r.inclusionAndDiversity || 5) / 10) * 0.20 + ((r.communicationClarity || 5) / 10) * 0.15;
        const individualRisk = (1 - individualScore) * 100;
        const gnnRisk = (individualRisk * 0.6) + (departmentAvgRisk * 0.4);
        return Math.round(Math.max(0, Math.min(100, gnnRisk)));
    } catch (err) {
        console.error("GNN Scorer Error:", err.message);
        const r = typeof responses === 'string' ? JSON.parse(responses) : (responses || {});
        const score = ((r.relationshipWithTeam || 5) + (r.relationshipWithTL || 5) + (r.inclusionAndDiversity || 5)) / 30;
        return Math.round((1 - score) * 100);
    }
}
module.exports = { gnnScore };
