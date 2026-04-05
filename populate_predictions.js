const { sequelize } = require('./config/db');
const Survey = require('./models/Survey');
const AttritionPrediction = require('./models/AttritionPrediction');
const { runEnsemble } = require('./ai/ensembleEngine');

async function populatePredictions() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const surveys = await Survey.findAll();
        console.log(`Found ${surveys.length} surveys.`);

        for (const survey of surveys) {
            const existing = await AttritionPrediction.findOne({ where: { surveyId: survey.id } });
            if (!existing) {
                console.log(`Generating prediction for ${survey.employeeName}...`);
                const surveyData = {
                    responses: survey.responses,
                    age: survey.age, gender: survey.gender, department: survey.department,
                    yearsAtCompany: survey.yearsAtCompany, employeeId: survey.employeeId,
                    employeeName: survey.employeeName
                };

                const aiResults = await runEnsemble(surveyData, Survey);
                await AttritionPrediction.create({ 
                    surveyId: survey.id, 
                    employeeId: survey.employeeId, 
                    employeeName: survey.employeeName, 
                    department: survey.department, 
                    ...aiResults 
                });
                console.log(`Created prediction for ${survey.employeeName}.`);
            } else {
                console.log(`Prediction already exists for ${survey.employeeName}.`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

populatePredictions();
