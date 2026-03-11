import mongoose from 'mongoose';

const orderDeliverySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['delivery', 'return_pickup'],
        default: 'delivery'
    },
    // For return_pickup: where to drop the item back
    dropDestinationType: {
        type: String,
        enum: ['branch', 'vendor'],
        default: null
    },
    dropDestinationId: {
        type: mongoose.Schema.Types.ObjectId,
        // ref is either 'Branch' or 'Vendor' based on dropDestinationType
        default: null
    },
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
        enum: [
            'pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'returned',
            'return_pickup_assigned', 'return_in_transit', 'return_delivered'
        ],
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
    pickupFee: {
        type: Number,
        default: 0  // delivery partners are paid monthly, no per-task fee
    },
    returnPickedUpAt: { type: Date, default: null },
    returnDeliveredAt: { type: Date, default: null },
    customerSignature: String,
    deliveryPhoto: String,
    notes: String
}, {
    timestamps: true
});

orderDeliverySchema.index({ 'trackingPath.location': '2dsphere' });

const OrderDelivery = mongoose.model('OrderDelivery', orderDeliverySchema);
export default OrderDelivery;
