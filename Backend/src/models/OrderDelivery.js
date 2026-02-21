import mongoose from 'mongoose';

const orderDeliverySchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    deliveryPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryPartner'
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'returned'],
        default: 'pending'
    },
    assignedAt: Date,
    pickedUpAt: Date,
    deliveredAt: Date,
    trackingPath: [{
        location: {
            type: { type: String, default: 'Point' },
            coordinates: [Number]
        },
        timestamp: { type: Date, default: Date.now }
    }],
    deliveryFee: {
        type: Number,
        default: 0
    },
    customerSignature: String,
    deliveryPhoto: String,
    notes: String
}, {
    timestamps: true
});

orderDeliverySchema.index({ 'trackingPath.location': '2dsphere' });

const OrderDelivery = mongoose.model('OrderDelivery', orderDeliverySchema);
export default OrderDelivery;
