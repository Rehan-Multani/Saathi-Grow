import mongoose from 'mongoose';

const promoCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Promo code is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: ['Percentage', 'Fixed', 'FreeShipping'],
        required: [true, 'Discount type is required']
    },
    discountValue: {
        type: Number,
        required: [true, 'Discount value is required'],
        min: 0
    },
    maxDiscountAmount: {
        type: Number, // Cap for percentage discounts
        default: 0
    },
    minOrderValue: {
        type: Number,
        default: 0
    },
    usageLimitTotal: {
        type: Number, // Global limit for this code
        default: 0 // 0 means unlimited
    },
    usageLimitPerUser: {
        type: Number, // Limit per user
        default: 1
    },
    usedCount: {
        type: Number,
        default: 0
    },
    validFrom: {
        type: Date,
        required: [true, 'Start date is required']
    },
    validUntil: {
        type: Date,
        required: [true, 'Expiry date is required']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const PromoCode = mongoose.model('PromoCode', promoCodeSchema);
export default PromoCode;
