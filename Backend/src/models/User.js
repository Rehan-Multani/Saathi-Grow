import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        default: 'New Saathi'
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        sparse: true, // Allow multiple nulls but unique if present
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Please provide your phone number'],
        unique: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'staff', 'rider'],
        default: 'user'
    },
    // OTP Fields for Login/Register
    otp: {
        type: String,
        select: false
    },
    otpExpires: {
        type: Date,
        select: false
    },
    addresses: [{
        label: { type: String, default: 'Home' }, // Home, Work, etc.
        street: String,
        city: String,
        state: String,
        zipCode: String,
        isDefault: { type: Boolean, default: false },
        location: {
            type: { type: String, default: 'Point' },
            coordinates: [Number] // [longitude, latitude] for hyperlocal mapping
        }
    }],
    walletBalance: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for geospatial queries tracking addresses
userSchema.index({ "addresses.location": "2dsphere" });

const User = mongoose.model('User', userSchema);
export default User;
