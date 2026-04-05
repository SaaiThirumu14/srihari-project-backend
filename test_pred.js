const { runEnsemble } = require('./ai/ensembleEngine');
const Survey = require('./models/Survey');
const { connectDB } = require('./config/db');

async function testPrediction() {
    await connectDB();
    const surveyData = {
        employeeName: 'Test',
        department: 'Engineering',
        yearsAtCompany: 3,
        age: 30,
        responses: {
            compensationSatisfaction: 5,
            careerGrowth: 5,
            stressLevel: 5,
            workLifeBalance: 5,
            relationshipWithTL: 5,
            managerSupport: 5,
            recognitionAndRewards: 5,
            learningOpportunities: 5,
            remoteWorkFlexibility: 5,
            mentalHealthSupport: 5,
            jobSatisfaction: 5,
            companyLoyalty: 5,
            overallHappiness: 5
        }
    };
    try {
        const result = await runEnsemble(surveyData, Survey);
        console.log('Prediction success:', result);
    } catch (err) {
        console.error('Prediction failed:', err);
    }
    process.exit(0);
}

testPrediction();
