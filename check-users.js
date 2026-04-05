const { sequelize } = require('./config/db');
const User = require('./models/User');

async function checkUsers() {
    await sequelize.authenticate();
    const users = await User.findAll({ attributes: ['id', 'name', 'role', 'department'] });
    console.log(JSON.stringify(users, null, 2));
    process.exit();
}
checkUsers();
