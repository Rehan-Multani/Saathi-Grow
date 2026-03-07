import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    category: {
        type: String,
        enum: ['delivery_fee', 'incentive', 'payout', 'adjustment', 'cash_collection', 'return_pickup_fee', 'order_revenue', 'platform_commission'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    },
    description: String,
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'referenceModel'
    },
    referenceModel: {
        type: String,
        enum: ['OrderDelivery', 'VendorPayout', 'DeliveryRun', 'Order', 'Vendor']
    }
}, {
    timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
