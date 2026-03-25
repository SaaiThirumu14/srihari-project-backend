const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    calories: { type: Number },
    image: { type: String },
    description: { type: String },
    popular: { type: Boolean, default: false },
    isSpecial: { type: Boolean, default: false },
    available: { type: Boolean, default: true }
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
