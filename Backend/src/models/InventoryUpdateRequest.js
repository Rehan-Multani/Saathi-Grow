import mongoose from 'mongoose';

const inventoryUpdateRequestSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  currentStock: {
    type: Number,
    required: true
  },
  requestedStock: {
    type: Number,
    required: true
  },
  adjustmentType: {
    type: String,
    enum: ['add', 'subtract', 'set'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  notes: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const InventoryUpdateRequest = mongoose.model('InventoryUpdateRequest', inventoryUpdateRequestSchema);
export default InventoryUpdateRequest;
