import mongoose from 'mongoose';

const deliveryPartnerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'busy'],
        default: 'offline'
    },
    vehicleType: {
        type: String,
        enum: ['bike', 'scooter', 'cycle', 'car'],
        required: true
    },
    vehicleNumber: {
        type: String,
        required: true
    },
    currentLocation: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    },
    serviceArea: {
        radius: {
            type: Number,
            default: 10 // km
        },
        center: {
            type: {
                type: String,
                default: 'Point'
            },
            coordinates: [Number]
        }
    },
    bankDetails: {
        accountHolderName: String,
        accountNumber: String,
        bankName: String,
        ifscCode: String
    },
    ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    walletBalance: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

deliveryPartnerSchema.index({ currentLocation: '2dsphere' });
deliveryPartnerSchema.index({ 'serviceArea.center': '2dsphere' });

const DeliveryPartner = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
export default DeliveryPartner;
