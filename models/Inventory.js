const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    quantity: { type: Number, required: true, default: 0 },
    unit: { type: String, required: true, default: 'units' },
    threshold: { type: Number, default: 10 },
    category: {
        type: String,
        enum: ['Produce', 'Grains', 'Meat', 'Dairy', 'Spices', 'Other'],
        default: 'Other'
    },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
