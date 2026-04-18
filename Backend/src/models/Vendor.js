import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const vendorSchema = new mongoose.Schema({
  storeName: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true
  },
  ownerName: {
    type: String,
    required: [true, 'Owner name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true
  },
  address: {
    street: { type: String, required: [true, 'Street address is required'] },
    city: { type: String, required: [true, 'City is required'] },
    state: { type: String, required: [true, 'State is required'] },
    zipCode: { type: String, required: [true, 'Zip code is required'] },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Location coordinates are required']
      }
    }
  },
  description: {
    type: String
  },
  logo: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Inactive'],
    default: 'Pending'
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin'
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
  // One bank account / UPI per vendor for withdrawals
  bankAccount: {
    accountHolderName: { type: String, trim: true, default: '' },
    accountNumber:     { type: String, trim: true, default: '' },
    ifscCode:          { type: String, trim: true, uppercase: true, default: '' },
    bankName:          { type: String, trim: true, default: '' },
    upiId:             { type: String, trim: true, default: '' },
    addedAt:           { type: Date }
  }
}, {
  timestamps: true
});

vendorSchema.index({ "address.location": "2dsphere" });

// Hash password before saving
vendorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check password
vendorSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const Vendor = mongoose.model('Vendor', vendorSchema);

export default Vendor;
