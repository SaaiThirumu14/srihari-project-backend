const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const Poll = require('../models/Poll');
const Feedback = require('../models/Feedback');
const FoodSuggestion = require('../models/FoodSuggestion');
const GamificationService = require('../services/gamificationService');

// Menu
exports.getAllMenuItems = async (req, res) => {
    try { res.json(await MenuItem.find()); } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.createMenuItem = async (req, res) => {
    try { res.status(201).json(await MenuItem.create(req.body)); } catch (err) { res.status(400).json({ message: err.message }); }
};
exports.deleteMenuItem = async (req, res) => {
    try { await MenuItem.findByIdAndDelete(req.params.id); res.json({ message: 'Removed' }); } catch (err) { res.status(500).json({ message: err.message }); }
};

// Orders
exports.placeOrder = async (req, res) => {
    try {
        const { items, totalPrice, deliveryTime, deliveryLocation } = req.body;
        const newOrder = await Order.create({ userId: req.user._id, userName: req.user.name, items, totalPrice, deliveryTime, deliveryLocation });
        await GamificationService.rewardFoodOrder(req.user._id, totalPrice);
        res.status(201).json(newOrder);
    } catch (err) { res.status(400).json({ message: err.message }); }
};
exports.getAllOrders = async (req, res) => {
    try { res.json(await Order.find().sort({ createdAt: -1 })); } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.getMyOrders = async (req, res) => {
    try {
        const filter = ['Chef', 'Admin'].includes(req.user.role) ? {} : { userId: req.user._id };
        res.json(await Order.find(filter).sort({ createdAt: -1 }));
    } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) { res.status(400).json({ message: err.message }); }
};

// Polls
exports.getPolls = async (req, res) => {
    try { res.json(await Poll.find().sort({ createdAt: -1 })); } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.createPoll = async (req, res) => {
    try {
        const { question, options, endDate } = req.body;
        res.status(201).json(await Poll.create({ question, options, endDate, status: 'Active' }));
    } catch (err) { res.status(400).json({ message: err.message }); }
};
exports.deletePoll = async (req, res) => {
    try { await Poll.findByIdAndDelete(req.params.id); res.json({ message: 'Poll deleted' }); } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.votePoll = async (req, res) => {
    const { pollId, optionId } = req.body;
    try {
        const poll = await Poll.findById(pollId);
        if (!poll) return res.status(404).json({ message: 'Poll not found' });
        if (poll.votedEmployees.find(v => v.employeeId.toString() === req.user._id.toString())) return res.status(400).json({ message: 'Already voted' });
        const option = poll.options.find(opt => opt.id === optionId);
        if (option) {
            option.votes += 1;
            poll.votedEmployees.push({ employeeId: req.user._id, optionId, submittedAt: new Date() });
            await poll.save();
            await GamificationService.awardPoints(req.user._id, 5, 'Poll Engagement');
            res.json(poll);
        } else res.status(404).json({ message: 'Option not found' });
    } catch (err) { res.status(400).json({ message: err.message }); }
};

// Suggestions
exports.submitSuggestion = async (req, res) => {
    try {
        const { foodName, description } = req.body;
        res.status(201).json(await FoodSuggestion.create({ employeeId: req.user._id, employeeName: req.user.name, foodName, description }));
    } catch (err) { res.status(400).json({ message: err.message }); }
};
exports.getSuggestions = async (req, res) => {
    try {
        const filter = ['Chef', 'Admin'].includes(req.user.role) ? {} : { employeeId: req.user._id };
        res.json(await FoodSuggestion.find(filter).sort({ createdAt: -1 }));
    } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.updateSuggestionStatus = async (req, res) => {
    try { res.json(await FoodSuggestion.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })); } catch (err) { res.status(400).json({ message: err.message }); }
};

// Feedback
exports.submitFeedback = async (req, res) => {
    try { res.status(201).json(await Feedback.create({ userId: req.user._id, userName: req.user.name, ...req.body })); } catch (err) { res.status(400).json({ message: err.message }); }
};
