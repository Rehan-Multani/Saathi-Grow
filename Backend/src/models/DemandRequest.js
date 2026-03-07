import mongoose from 'mongoose';

const demandRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'storeModel',
    default: null
  },
  storeModel: {
    type: String,
    enum: ['Branch', 'Vendor'],
    default: 'Branch'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true // [longitude, latitude]
    },
    address: String
  },
  requestType: {
    type: String,
    enum: ['OUT_OF_STOCK', 'OUT_OF_ZONE'],
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'NOTIFIED', 'EXPANDED', 'NOT_APPLICABLE'],
    default: 'PENDING'
  },
  contactInfo: {
    phone: String,
    email: String
  }
}, {
  timestamps: true
});

// Index for geo heatmap
demandRequestSchema.index({ location: '2dsphere' });

const DemandRequest = mongoose.model('DemandRequest', demandRequestSchema);
export default DemandRequest;
