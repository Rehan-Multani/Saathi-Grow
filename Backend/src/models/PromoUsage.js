import mongoose from 'mongoose';

const promoUsageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    promoCode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PromoCode',
        required: true
    },
    usageCount: {
        type: Number,
        default: 0
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }]
}, {
    timestamps: true
});

// Compound index to ensure uniqueness per user per promo
promoUsageSchema.index({ user: 1, promoCode: 1 }, { unique: true });

const PromoUsage = mongoose.model('PromoUsage', promoUsageSchema);
export default PromoUsage;
