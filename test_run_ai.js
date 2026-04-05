const { sequelize } = require('./config/db');
const Survey = require('./models/Survey');
const AttritionPrediction = require('./models/AttritionPrediction');
const { runEnsemble } = require('./ai/ensembleEngine');

async function testRunAI() {
    try {
        await sequelize.authenticate();
        console.log('DB connected.');

        // Get all surveys
        const surveys = await Survey.findAll();
        console.log(`Found ${surveys.length} surveys.`);

        for (const survey of surveys) {
            console.log(`\n--- Survey ID: ${survey.id} ---`);
            console.log(`Employee: ${survey.employeeName}`);
            console.log(`Responses type: ${typeof survey.responses}`);
            
            const responses = typeof survey.responses === 'string' 
                ? JSON.parse(survey.responses) 
                : survey.responses;
            
            console.log(`Responses keys: ${Object.keys(responses || {}).join(', ')}`);
            console.log(`Responses values sample: jobSatisfaction=${responses?.jobSatisfaction}, stressLevel=${responses?.stressLevel}`);

            // Try running ensemble
            try {
                const surveyData = {
                    responses: responses,
                    age: survey.age, gender: survey.gender, department: survey.department,
                    yearsAtCompany: survey.yearsAtCompany, employeeId: survey.employeeId,
                    employeeName: survey.employeeName
                };

                console.log('Running ensemble...');
                const aiResults = await runEnsemble(surveyData, Survey);
                console.log('SUCCESS! Prediction:', aiResults.prediction, 'Risk:', aiResults.riskLevel);
            } catch (err) {
                console.error('ENSEMBLE ERROR:', err.message);
                console.error('Stack:', err.stack);
            }
        }
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        process.exit();
    }
}

testRunAI();
