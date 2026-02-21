import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
    deliveryPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryPartner',
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    pendingPayouts: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Wallet = mongoose.model('Wallet', walletSchema);
export default Wallet;
