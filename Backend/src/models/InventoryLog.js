import mongoose from 'mongoose';

const inventoryLogSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: false // Optional for system/order triggers
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: false
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: false
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false
  },
  changeAmount: {
    type: Number,
    required: true
  },
  previousStock: {
    type: Number,
    required: true
  },
  newStock: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['Addition', 'Deduction', 'Audit', 'Sale', 'Return', 'Damage', 'Removal'],
    required: true
  },
  reason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema);
export default InventoryLog;
