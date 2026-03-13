import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const deliveryPartnerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    uniqueId: {
        type: String,
        unique: true,
        default: function () {
            return 'DP-' + Math.floor(100 + Math.random() * 900) + Date.now().toString().slice(-4);
        }
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: false
    },
    otp: {
        type: String,
        select: false
    },
    otpExpires: {
        type: Date,
        select: false
    },
    profileImage: {
        type: String
    },
    profileImagePublicId: {
        type: String
    },
    vehicleType: {
        type: String,
        enum: ['Bike', 'EV', 'Cycle', 'Other'],
        default: 'Bike'
    },
    vehicleNumber: {
        type: String,
        required: false
    },
    authStatus: {
        type: String,
        enum: ['Active', 'Suspended', 'Unverified'],
        default: 'Active'
    },
    dutyStatus: {
        type: String,
        enum: ['Online', 'Offline'],
        default: 'Offline'
    },
    assignmentStatus: {
        type: String,
        enum: ['Free', 'Busy'],
        default: 'Free'
    },
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    },
    activeOrder: {
        // Legacy: used by old 1-to-1 assignment. Kept for backward compat.
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null
    },
    // Sprint 1: DeliveryRun system additions
    activeRun: {
        // The current DeliveryRun batch assigned to this partner
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryRun',
        default: null
    },
    currentStopIndex: {
        // 0-based index of which stop in the run the partner is currently working on
        type: Number,
        default: 0
    },
    totalDeliveries: {
        type: Number,
        default: 0
    },
    bankDetails: {
        accountHolderName: String,
        accountNumber: String,
        bankName: String,
        ifscCode: String
    },
    cashInHand: {
        type: Number,
        default: 0
    },
    lastSettledAt: {
        type: Date
    },
    fcmToken: {
        app: {
            type: String,
            default: ''
        },
        web: {
            type: String,
            default: ''
        }
    }
}, {
    timestamps: true
});

// Create spatial index for location queries
deliveryPartnerSchema.index({ currentLocation: '2dsphere' });

// Match generic password comparison method
deliveryPartnerSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Hash password synchronously before save if it exists
deliveryPartnerSchema.pre('save', async function (next) {
    if (!this.password || !this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const DeliveryPartner = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
export default DeliveryPartner;
