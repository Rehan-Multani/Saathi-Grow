import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Branch name is required'],
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: [true, 'Branch code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: [Number] // [longitude, latitude]
    }
  },
  phone: {
    type: String,
    required: [true, 'Branch phone is required']
  },
  email: {
    type: String,
    lowercase: true
  },
  isActive: {
    type: Boolean,
    default: true
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
  },
  logo: {
    type: String,
    default: ''
  },
  /** Service area radius in KM — products only visible to users within this distance */
  deliveryRadius: {
    type: Number,
    default: 20,
    min: [1, 'Delivery radius must be at least 1 km'],
    max: [200, 'Delivery radius cannot exceed 200 km']
  }
}, {
  timestamps: true
});

branchSchema.index({ "address.location": "2dsphere" });

const Branch = mongoose.model('Branch', branchSchema);
export default Branch;
