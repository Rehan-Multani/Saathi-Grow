import mongoose from 'mongoose';

const cashCollectionSchema = new mongoose.Schema({
  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryPartner',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['collected', 'settled_with_admin'],
    default: 'collected'
  },
  collectedAt: {
    type: Date,
    default: Date.now
  },
  settledAt: Date,
  adminAcknowledge: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const CashCollection = mongoose.model('CashCollection', cashCollectionSchema);
export default CashCollection;
