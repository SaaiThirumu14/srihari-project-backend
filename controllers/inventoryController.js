const Inventory = require('../models/Inventory');

exports.getInventory = async (req, res) => {
    try { res.json(await Inventory.findAll({ order: [['name', 'ASC']] })); } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addInventoryItem = async (req, res) => {
    try {
        const { name, quantity, unit, threshold, category } = req.body;
        res.status(201).json(await Inventory.create({ name, quantity, unit, threshold, category }));
    } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateInventory = async (req, res) => {
    try {
        const item = await Inventory.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        req.body.lastUpdated = new Date();
        await item.update(req.body);
        res.json(item);
    } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteInventoryItem = async (req, res) => {
    try { await Inventory.destroy({ where: { id: req.params.id } }); res.json({ message: 'Item removed' }); } catch (err) { res.status(500).json({ message: err.message }); }
};
