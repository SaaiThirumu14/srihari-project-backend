const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const register = async (req, res) => {
    const { name, email, password, role, department, designation, employeeId, deptId } = req.body;
    try {
        const userExists = await User.findOne({ email: email.toLowerCase().trim() });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = { name, email: email.toLowerCase().trim(), password: hashedPassword, role: role || 'Employee', department, designation };
        if (employeeId) userData.employeeId = employeeId;
        if (deptId) userData.deptId = deptId;

        const user = await User.create(userData);

        res.status(201).json({
            _id: user._id, name: user.name, email: user.email, role: user.role,
            department: user.department, token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

const login = async (req, res) => {
    let { email, password } = req.body;
    email = email.toLowerCase().trim();
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

        res.json({
            _id: user._id, name: user.name, email: user.email, role: user.role,
            department: user.department, token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) res.json(user);
        else res.status(404).json({ message: 'User not found' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register, login, getMe };
