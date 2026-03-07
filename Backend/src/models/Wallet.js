import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'ownerModel'
    },
    ownerModel: {
        type: String,
        required: true,
        enum: ['Vendor']
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
