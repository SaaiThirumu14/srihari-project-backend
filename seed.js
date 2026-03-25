require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Inventory = require('./models/Inventory');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/workspace_ai';

const users = [
    { name: 'Super Admin', email: 'admin@company.com', password: 'password123', role: 'Admin', department: 'Management', designation: 'Platform Administrator' },
    { name: 'HR Manager', email: 'hr@company.com', password: 'password123', role: 'HR', department: 'Human Resources', designation: 'HR Director' },
    { name: 'Sarah Leader', email: 'tl@company.com', password: 'password123', role: 'TeamLeader', department: 'Frontend Developer', designation: 'Tech Lead', deptId: 'FE-01' },
    { name: 'Alice Coder', email: 'alice@company.com', password: 'password123', role: 'Employee', department: 'Frontend Developer', designation: 'Senior Developer', employeeId: 'EMP-001' },
    { name: 'John Developer', email: 'john@company.com', password: 'password123', role: 'Employee', department: 'Backend Developer', designation: 'Junior Developer', employeeId: 'EMP-002' },
    { name: 'Chef Gordon', email: 'chef@company.com', password: 'password123', role: 'Chef', department: 'Cafeteria Operations', designation: 'Head Chef' }
];

const menuItems = [
    { name: 'Classic Burger', category: 'Lunch', price: 120, calories: 550, description: 'Juicy beef patty with fresh lettuce and tomato', popular: true, available: true },
    { name: 'Caesar Salad', category: 'Lunch', price: 90, calories: 280, description: 'Crisp romaine with parmesan and croutons', popular: false, available: true },
    { name: 'Masala Dosa', category: 'Breakfast', price: 60, calories: 350, description: 'Crispy rice crepe with spiced potato filling', popular: true, available: true },
    { name: 'Butter Chicken', category: 'Lunch', price: 150, calories: 490, description: 'Creamy tomato-based chicken curry', popular: true, available: true },
    { name: 'Veg Biryani', category: 'Lunch', price: 110, calories: 420, description: 'Fragrant rice with mixed vegetables and spices', popular: false, available: true },
    { name: 'Cold Coffee', category: 'Snacks', price: 70, calories: 180, description: 'Chilled coffee blended with ice cream', popular: true, available: true },
    { name: 'Samosa', category: 'Snacks', price: 30, calories: 260, description: 'Crispy pastry with spiced potato filling', popular: true, available: true },
    { name: 'Idli Sambhar', category: 'Breakfast', price: 50, calories: 220, description: 'Steamed rice cakes with lentil soup', popular: false, available: true },
    { name: 'Paneer Wrap', category: 'Lunch', price: 100, calories: 380, description: 'Grilled paneer in a tortilla with veggies', popular: false, available: true },
    { name: 'Fresh Juice', category: 'Snacks', price: 55, calories: 120, description: 'Seasonal fresh fruit juice', popular: true, available: true }
];

const inventoryItems = [
    { name: 'Rice', quantity: 50, unit: 'kg', threshold: 10, category: 'Grains' },
    { name: 'Chicken', quantity: 20, unit: 'kg', threshold: 5, category: 'Meat' },
    { name: 'Tomatoes', quantity: 15, unit: 'kg', threshold: 5, category: 'Produce' },
    { name: 'Onions', quantity: 25, unit: 'kg', threshold: 8, category: 'Produce' },
    { name: 'Milk', quantity: 30, unit: 'liters', threshold: 10, category: 'Dairy' },
    { name: 'Cumin', quantity: 3, unit: 'kg', threshold: 1, category: 'Spices' },
    { name: 'Flour', quantity: 40, unit: 'kg', threshold: 10, category: 'Grains' },
    { name: 'Paneer', quantity: 10, unit: 'kg', threshold: 3, category: 'Dairy' }
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await MenuItem.deleteMany({});
        await Inventory.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Seed users
        for (const u of users) {
            const salt = await bcrypt.genSalt(10);
            u.password = await bcrypt.hash(u.password, salt);
        }
        await User.insertMany(users);
        console.log(`👤 Seeded ${users.length} users`);

        // Seed menu items
        await MenuItem.insertMany(menuItems);
        console.log(`🍱 Seeded ${menuItems.length} menu items`);

        // Seed inventory
        await Inventory.insertMany(inventoryItems);
        console.log(`📦 Seeded ${inventoryItems.length} inventory items`);

        console.log('\n✅ Seed complete! Default password for all users: password123');
        console.log('\n📋 Demo Credentials:');
        console.log('  Admin:       admin@company.com');
        console.log('  HR:          hr@company.com');
        console.log('  Team Leader: tl@company.com');
        console.log('  Employee 1:  alice@company.com');
        console.log('  Employee 2:  john@company.com');
        console.log('  Chef:        chef@company.com\n');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err);
        process.exit(1);
    }
}

seed();
