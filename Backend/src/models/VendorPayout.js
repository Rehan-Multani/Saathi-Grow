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
    min: [1, 'Minimum withdrawal amount is ₹1']
  },
  // Withdrawal destination (UPI ID or Bank details provided by vendor)
  upiId: {
    type: String,
    trim: true,
    default: ''
  },
  payoutDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Paid', 'Rejected', 'Failed'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    default: 'UPI'
  },
  referenceNumber: {
    type: String,
    default: '-'
  },
  note: {
    type: String,
    trim: true
  },
  // requestType: 'vendor_request' for vendor-initiated, 'admin_payout' for admin-created
  requestType: {
    type: String,
    enum: ['vendor_request', 'admin_payout'],
    default: 'vendor_request'
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  processedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const VendorPayout = mongoose.model('VendorPayout', vendorPayoutSchema);
export default VendorPayout;

