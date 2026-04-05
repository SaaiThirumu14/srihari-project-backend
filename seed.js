require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB, sequelize } = require('./config/db');

// Registered Models
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Inventory = require('./models/Inventory');
const Poll = require('./models/Poll');
const Order = require('./models/Order');
const AttritionPrediction = require('./models/AttritionPrediction');
const Survey = require('./models/Survey');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');
const Chat = require('./models/Chat');
const Promotion = require('./models/PromotionAlert'); // Fixed name
const Shoutout = require('./models/Shoutout');
const Wellness = require('./models/Wellness');
const Task = require('./models/Task');
const Feedback = require('./models/Feedback');
const FoodSuggestion = require('./models/FoodSuggestion');

const users = [
    { name: 'Super Admin', email: 'admin@company.com', password: 'password123', role: 'Admin', department: 'Management' },
    { name: 'HR Manager', email: 'hr@company.com', password: 'password123', role: 'HR', department: 'Management' },
    { name: 'Team Lead', email: 'tl@company.com', password: 'password123', role: 'TeamLeader', department: 'Engineering' },
    { name: 'Chef Gordon', email: 'chef@company.com', password: 'password123', role: 'Chef', department: 'Cafeteria' },
    { name: 'Alice Coder', email: 'alice@company.com', password: 'password123', role: 'Employee', department: 'Engineering', employeeId: 'EMP-001' },
    { name: 'John Doe', email: 'john@company.com', password: 'password123', role: 'Employee', department: 'Marketing', employeeId: 'EMP-002' }
];

const menuItems = [
    { name: 'Butter Chicken', category: 'Lunch', price: 150, calories: 450, description: 'Chef special', popular: true, available: true },
    { name: 'Veg Salad', category: 'Lunch', price: 80, calories: 120, description: 'Healthy', popular: false, available: true }
];

async function seed() {
    try {
        await connectDB();
        
        // Recreate all tables safely
        await sequelize.sync({ force: true });
        console.log('✅ CLEAN SYNC COMPLETE');

        for (const u of users) {
            const salt = await bcrypt.genSalt(10);
            u.password = await bcrypt.hash(u.password, salt);
            await User.create(u);
        }
        console.log(`👤 Seeded ${users.length} users`);

        await MenuItem.bulkCreate(menuItems);
        await Poll.create({ question: 'Special Dinner?', options: [{id:1, label: 'Indian'}, {id:2, label:'Continental'}], status: 'Active' });
        
        console.log('✅ ALL OK. STARTING SERVER...');
        process.exit(0);
    } catch (err) {
        console.error('❌ SEED FAIL:', err);
        process.exit(1);
    }
}
seed();
