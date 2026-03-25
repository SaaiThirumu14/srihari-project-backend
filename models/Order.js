const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    items: [{
        menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
        name: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true }
    }],
    totalPrice: { type: Number, required: true },
    deliveryTime: { type: String, required: true },
    deliveryLocation: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Preparing', 'Ready', 'Delivered'], default: 'Pending' },
    estimatedReadyTime: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
