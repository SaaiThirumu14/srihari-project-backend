const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const Poll = require('../models/Poll');
const Feedback = require('../models/Feedback');
const FoodSuggestion = require('../models/FoodSuggestion');
const GamificationService = require('../services/gamificationService');

// Menu
exports.getAllMenuItems = async (req, res) => {
    try { res.json(await MenuItem.findAll()); } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.createMenuItem = async (req, res) => {
    try { res.status(201).json(await MenuItem.create(req.body)); } catch (err) { res.status(400).json({ message: err.message }); }
};
exports.deleteMenuItem = async (req, res) => {
    try {
        await MenuItem.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Removed' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// Orders
exports.placeOrder = async (req, res) => {
    try {
        const { items, totalPrice, deliveryTime, deliveryLocation } = req.body;
        const newOrder = await Order.create({ userId: req.user.id, userName: req.user.name, items, totalPrice, deliveryTime, deliveryLocation });
        await GamificationService.rewardFoodOrder(req.user.id, totalPrice);
        res.status(201).json(newOrder);
    } catch (err) { res.status(400).json({ message: err.message }); }
};
exports.getAllOrders = async (req, res) => {
    try { res.json(await Order.findAll({ order: [['createdAt', 'DESC']] })); } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.getMyOrders = async (req, res) => {
    try {
        const where = ['Chef', 'Admin'].includes(req.user.role) ? {} : { userId: req.user.id };
        res.json(await Order.findAll({ where, order: [['createdAt', 'DESC']] }));
    } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        await order.update(req.body);
        res.json(order);
    } catch (err) { res.status(400).json({ message: err.message }); }
};

// Polls
exports.getPolls = async (req, res) => {
    try { res.json(await Poll.findAll({ order: [['createdAt', 'DESC']] })); } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.createPoll = async (req, res) => {
    try {
        const { question, options, endDate } = req.body;
        res.status(201).json(await Poll.create({ question, options, endDate, status: 'Active' }));
    } catch (err) { res.status(400).json({ message: err.message }); }
};
exports.deletePoll = async (req, res) => {
    try { await Poll.destroy({ where: { id: req.params.id } }); res.json({ message: 'Poll deleted' }); } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.votePoll = async (req, res) => {
    const { pollId, optionId } = req.body;
    try {
        const poll = await Poll.findByPk(pollId);
        if (!poll) return res.status(404).json({ message: 'Poll not found' });

        // Ensure JSON parsing for robustness
        let votedEmployees = poll.votedEmployees;
        if (typeof votedEmployees === 'string') try { votedEmployees = JSON.parse(votedEmployees); } catch { votedEmployees = []; }
        if (!votedEmployees) votedEmployees = [];

        let options = poll.options;
        if (typeof options === 'string') try { options = JSON.parse(options); } catch { options = []; }
        if (!options) options = [];

        const voted = votedEmployees.find(v => v.employeeId == req.user.id);
        if (voted) return res.status(400).json({ message: 'Already voted' });

        const updatedOptions = options.map(opt => {
            // Use loose equality to handle string/number mismatches in IDs
            if (opt.id == optionId) return { ...opt, votes: (opt.votes || 0) + 1 };
            return opt;
        });
        const updatedVoted = [...votedEmployees, { employeeId: req.user.id, optionId, submittedAt: new Date() }];

        poll.options = updatedOptions;
        poll.votedEmployees = updatedVoted;
        await poll.save();

        await GamificationService.awardPoints(req.user.id, 5, 'Poll Engagement');
        res.json(poll);
    } catch (err) {
        console.error('❌ Vote Error:', err.message);
        res.status(400).json({ message: err.message });
    }
};

// Suggestions
exports.submitSuggestion = async (req, res) => {
    try {
        const { foodName, description, suggestedMeal } = req.body;
        const name = foodName || suggestedMeal;
        if (!name) return res.status(400).json({ message: 'Food name is required' });
        
        res.status(201).json(await FoodSuggestion.create({ 
            employeeId: req.user.id, 
            employeeName: req.user.name, 
            foodName: name, 
            description: description || 'No description provided' 
        }));
    } catch (err) { res.status(400).json({ message: err.message }); }
};
exports.getSuggestions = async (req, res) => {
    try {
        const where = ['Chef', 'Admin'].includes(req.user.role) ? {} : { employeeId: req.user.id };
        res.json(await FoodSuggestion.findAll({ where, order: [['createdAt', 'DESC']] }));
    } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.updateSuggestionStatus = async (req, res) => {
    try {
        const item = await FoodSuggestion.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Not found' });
        await item.update({ status: req.body.status });
        res.json(item);
    } catch (err) { res.status(400).json({ message: err.message }); }
};

// Feedback
exports.submitFeedback = async (req, res) => {
    try { res.status(201).json(await Feedback.create({ userId: req.user.id, userName: req.user.name, ...req.body })); } catch (err) { res.status(400).json({ message: err.message }); }
};
