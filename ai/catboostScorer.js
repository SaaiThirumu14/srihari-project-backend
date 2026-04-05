function catboostScore(surveyData) {
    const { responses, gender, department, age } = surveyData;
    const deptRiskMap = {
        'Frontend Developer': 0.35, 'Backend Developer': 0.30, 'Vibe Coder': 0.55,
        'Prompt Engineer': 0.45, 'Full Stack Developer': 0.38, 'DevOps Engineer': 0.28,
        'Data Scientist': 0.32, 'UI/UX Designer': 0.40, 'QA Engineer': 0.25, 'Product Manager': 0.22
    };
    const genderRiskMap = { 'Male': 0.33, 'Female': 0.28, 'Other': 0.30 };

    const deptRisk = deptRiskMap[department] || 0.35;
    const genderRisk = genderRiskMap[gender] || 0.31;
    const r = typeof responses === 'string' ? JSON.parse(responses) : (responses || {});
    const satisfactionIndex = ((r.jobSatisfaction || 5) + (r.compensationSatisfaction || 5) + (r.overallHappiness || 5)) / 30;
    const loyaltyIndex = ((r.companyLoyalty || 5) + (r.careerGrowth || 5)) / 20;

    let leafScore = (deptRisk * 0.3) + (genderRisk * 0.15);
    leafScore += (1 - satisfactionIndex) * 0.35;
    leafScore += (1 - loyaltyIndex) * 0.20;
    if (age < 28) leafScore += 0.08;
    if (age > 50) leafScore -= 0.05;

    return Math.round(Math.max(0, Math.min(100, leafScore * 100)));
}
module.exports = { catboostScore };
