const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });

const register = async (req, res) => {
    let { name, email, password, role, department, designation, employeeId, deptId } = req.body;
    try {
        email = email.toLowerCase().trim();
        const userExists = await User.findOne({ where: { email } });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = { 
            name, 
            email, 
            password: hashedPassword, 
            role: role || 'Employee', 
            department, 
            designation,
            employeeId,
            deptId
        };

        const user = await User.create(userData);

        res.status(201).json({
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role,
            department: user.department, 
            token: generateToken(user.id)
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

const login = async (req, res) => {
    let { email, password } = req.body;
    try {
        email = email.toLowerCase().trim();
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(401).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

        res.json({
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role,
            department: user.department, 
            token: generateToken(user.id)
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (user) res.json(user);
        else res.status(404).json({ message: 'User not found' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register, login, getMe };
