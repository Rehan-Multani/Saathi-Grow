import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        price: Number,
        name: String,
        image: String
    }],
    subTotal: {
        type: Number,
        default: 0
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    deliveryFee: {
        type: Number,
        default: 0
    },
    handlingFee: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    platformCommission: {
        type: Number,
        default: 0
    },
    vendorPayoutAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: [
            'pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered',
            'cancelled', 'return_requested', 'return_pickup_scheduled', 'return_picked_up', 'returned'
        ],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'online', 'wallet'],
        required: true
    },
    razorpayOrderId: {
        type: String,
        default: null
    },
    razorpayPaymentId: {
        type: String,
        default: null
    },
    razorpaySignature: {
        type: String,
        default: null
    },
    shippingAddress: {
        name: String,
        phone: String,
        street: String,
        city: String,
        state: String,
        zipCode: String,
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: false
            },
            coordinates: {
                type: [Number],
                required: false
            }
        }
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor'
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch'
    },
    deliverySlot: {
        type: String, // Legacy display label e.g. "Morning (9 AM - 11 AM)" — kept for backward compat
        default: null
    },
    // Sprint 1: DeliveryRun system additions
    deliverySlotId: {
        // Proper ObjectId ref to the DeliverySlot document (Sprint 2+: used for slot-grouping in admin)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliverySlot',
        default: null
    },
    isImmediate: {
        // true = customer chose ASAP delivery (no slot selected)
        type: Boolean,
        default: false
    },
    deliveryRunId: {
        // Link to the DeliveryRun batch this order was assigned to
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryRun',
        default: null
    },
    stopSequence: {
        // Position of this order within its DeliveryRun (1 = first stop, 2 = second, etc.)
        type: Number,
        default: null
    },
    // Delivery Q-Commerce Additions
    deliveryPartnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryPartner',
        default: null
    },
    deliveryOTP: {
        type: String, // 4 digit secure PIN
        default: null
    },
    proofOfDeliveryImage: {
        type: String, // Cloudinary Image URL
        default: null
    },
    deliveryTimestamps: {
        assignedAt: { type: Date, default: null },
        pickedUpAt: { type: Date, default: null },
        deliveredAt: { type: Date, default: null }
    },
    returnRequest: {
        isRequested: { type: Boolean, default: false },
        reason: { type: String, default: null },
        description: { type: String, default: null },
        images: { type: [String], default: [] },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
        requestDate: { type: Date, default: null },
        rejectionReason: { type: String, default: null },
        pickupScheduledAt: { type: Date, default: null },
        pickedUpAt: { type: Date, default: null },
        resolvedAt: { type: Date, default: null },
        pickupProofImage: { type: String, default: null },
        pickupPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartner', default: null },
        pickupDeliveryId: { type: mongoose.Schema.Types.ObjectId, ref: 'OrderDelivery', default: null }
    },
    cancellation: {
        isCancelled: { type: Boolean, default: false },
        reason: { type: String, default: null },
        cancelledAt: { type: Date, default: null }
    }
}, {
    timestamps: true
});

orderSchema.index({ 'shippingAddress.location': '2dsphere' });

const Order = mongoose.model('Order', orderSchema);
export default Order;
