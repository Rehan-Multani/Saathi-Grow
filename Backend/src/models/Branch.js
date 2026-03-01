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
  }
}, {
  timestamps: true
});

branchSchema.index({ "address.location": "2dsphere" });

const Branch = mongoose.model('Branch', branchSchema);
export default Branch;
