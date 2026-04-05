const { sequelize } = require('./config/db');
const Survey = require('./models/Survey');
const AttritionPrediction = require('./models/AttritionPrediction');
const User = require('./models/User');

async function checkState() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const users = await User.findAll({ attributes: ['id', 'name', 'role', 'department'] });
        console.log('--- USERS_START ---');
        console.log(JSON.stringify(users.map(u => u.toJSON()), null, 2));
        console.log('--- USERS_END ---');

        const surveys = await Survey.findAll();
        console.log('\n--- SURVEYS_START ---');
        console.log(JSON.stringify(surveys.map(s => ({
            id: s.id,
            employeeName: s.employeeName,
            department: s.department,
            forwardedToHR: s.forwardedToHR
        })), null, 2));
        console.log('--- SURVEYS_END ---');

        const predictions = await AttritionPrediction.findAll();
        console.log('\n--- PREDICTIONS_START ---');
        console.log(JSON.stringify(predictions.map(p => ({
            id: p.id,
            employeeName: p.employeeName,
            prediction: p.prediction,
            riskLevel: p.riskLevel
        })), null, 2));
        console.log('--- PREDICTIONS_END ---');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkState();
