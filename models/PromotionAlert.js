const mongoose = require('mongoose');

const promotionAlertSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['Alert', 'PromotionOffer'], default: 'Alert' },
    status: { type: String, enum: ['Unread', 'Read', 'Accepted', 'Rejected'], default: 'Unread' }
}, { timestamps: true });

module.exports = mongoose.model('PromotionAlert', promotionAlertSchema);
