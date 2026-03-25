const Inventory = require('../models/Inventory');

exports.getInventory = async (req, res) => {
    try { res.json(await Inventory.find().sort({ name: 1 })); } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addInventoryItem = async (req, res) => {
    try {
        const { name, quantity, unit, threshold, category } = req.body;
        res.status(201).json(await new Inventory({ name, quantity, unit, threshold, category }).save());
    } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateInventory = async (req, res) => {
    try {
        req.body.lastUpdated = Date.now();
        const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json(item);
    } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteInventoryItem = async (req, res) => {
    try { await Inventory.findByIdAndDelete(req.params.id); res.json({ message: 'Item removed' }); } catch (err) { res.status(500).json({ message: err.message }); }
};
