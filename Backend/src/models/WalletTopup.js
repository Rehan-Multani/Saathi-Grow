import mongoose from 'mongoose';

const walletTopupSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  razorpayOrderId: {
    type: String,
    default: null
  },
  razorpayPaymentId: {
    type: String,
    default: null
  },
  expectedAmountPaise: {
    type: Number,
    required: true,
    min: 1,
    validate: {
      validator: Number.isSafeInteger,
      message: 'Top-up amount must be stored as integer paise'
    }
  },
  creditedAmountPaise: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: Number.isSafeInteger,
      message: 'Credited amount must be stored as integer paise'
    }
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR']
  },
  status: {
    type: String,
    enum: ['creating', 'created', 'credited', 'failed', 'expired'],
    default: 'creating',
    index: true
  },
  providerPaymentStatus: {
    type: String,
    default: null
  },
  failureReason: {
    type: String,
    default: null,
    maxlength: 300
  },
  legacy: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  creditedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

walletTopupSchema.index(
  { razorpayOrderId: 1 },
  {
    unique: true,
    partialFilterExpression: { razorpayOrderId: { $type: 'string' } }
  }
);

walletTopupSchema.index(
  { razorpayPaymentId: 1 },
  {
    unique: true,
    partialFilterExpression: { razorpayPaymentId: { $type: 'string' } }
  }
);

walletTopupSchema.index({ user: 1, createdAt: -1 });

const WalletTopup = mongoose.model('WalletTopup', walletTopupSchema);
export default WalletTopup;
