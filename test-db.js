require('dotenv').config();
const { sequelize } = require('./config/db');
const User = require('./models/User');

async function test() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        const users = await User.findAll({ attributes: ['id', 'email'] });
        console.log('Users in DB:', users.map(u => u.email));
        process.exit(0);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

test();
