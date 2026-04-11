import mongoose from 'mongoose';

// Shared model for both Admin (branch-based) and Vendor (store-based) physical locations
const physicalLocationSchema = new mongoose.Schema({
  label: {
    type: String,
    required: [true, 'Location label is required'],
    trim: true
  },
  // For Admin branch products — link to a branch
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    default: null
  },
  // For Vendor products — link to the vendor
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null
  },
  // Which product is currently occupying this location (null = available)
  assignedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Compound unique: same label cannot be used twice in same branch or same vendor
physicalLocationSchema.index({ label: 1, branchId: 1 }, { unique: true, sparse: true, partialFilterExpression: { branchId: { $ne: null } } });
physicalLocationSchema.index({ label: 1, vendorId: 1 }, { unique: true, sparse: true, partialFilterExpression: { vendorId: { $ne: null } } });
physicalLocationSchema.index({ branchId: 1, isActive: 1 });
physicalLocationSchema.index({ vendorId: 1, isActive: 1 });

const PhysicalLocation = mongoose.model('PhysicalLocation', physicalLocationSchema);
export default PhysicalLocation;
