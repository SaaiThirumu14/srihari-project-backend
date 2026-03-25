function lightgbmScore(surveyData) {
    const { responses, age, yearsAtCompany } = surveyData;
    const weights = {
        jobSatisfaction: 0.18, careerGrowth: 0.15, companyLoyalty: 0.14,
        compensationSatisfaction: 0.12, stressLevel: 0.10, workLifeBalance: 0.09,
        workload: 0.08, managerSupport: 0.07, overallHappiness: 0.07
    };

    let score = 0;
    const r = responses;
    score += (r.jobSatisfaction / 10) * weights.jobSatisfaction;
    score += (r.careerGrowth / 10) * weights.careerGrowth;
    score += (r.companyLoyalty / 10) * weights.companyLoyalty;
    score += (r.compensationSatisfaction / 10) * weights.compensationSatisfaction;
    score += (r.workLifeBalance / 10) * weights.workLifeBalance;
    score += (r.managerSupport / 10) * weights.managerSupport;
    score += (r.overallHappiness / 10) * weights.overallHappiness;
    score += ((10 - r.stressLevel) / 10) * weights.stressLevel;
    score += ((10 - r.workload) / 10) * weights.workload;

    const tenureBonus = yearsAtCompany >= 3 ? 0.05 : yearsAtCompany >= 1 ? 0.02 : -0.03;
    score += tenureBonus;
    const ageFactor = (age >= 30 && age <= 45) ? 0.02 : 0;
    score += ageFactor;

    return Math.round(Math.max(0, Math.min(100, (1 - score) * 100)));
}
module.exports = { lightgbmScore };
