import mongoose from 'mongoose';

const deliveryLocationSchema = new mongoose.Schema({
    deliveryPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryPartner',
        required: true
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'busy'],
        default: 'online'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

deliveryLocationSchema.index({ location: '2dsphere' });

const DeliveryLocation = mongoose.model('DeliveryLocation', deliveryLocationSchema);
export default DeliveryLocation;
