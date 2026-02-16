import mongoose from 'mongoose';

const vendorPayoutSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Payout amount is required'],
    min: 0
  },
  payoutDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Paid', 'Processing', 'Failed'],
    default: 'Processing'
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    default: 'Bank Transfer'
  },
  referenceNumber: {
    type: String,
    default: '-'
  },
  note: {
    type: String,
    trim: true
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

const VendorPayout = mongoose.model('VendorPayout', vendorPayoutSchema);
export default VendorPayout;
