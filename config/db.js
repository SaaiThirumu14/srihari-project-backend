const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'promotionsystem',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false, // Set to console.log to see SQL queries
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL Connected (XAMPP)');
    } catch (error) {
        console.error('❌ MySQL Connection Error:', error.message);
        console.log('⚠️  Ensure XAMPP is running and the database "promotionsystem" exists.');
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
