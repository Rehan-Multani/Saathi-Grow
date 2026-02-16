import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  tags: [String],
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: 0
  },
  branchStocks: [{
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 10
    }
  }],
  unitType: {
    type: String,
    enum: ['pcs', 'kg', 'gm', 'ml', 'ltr', 'pkt', 'box'],
    default: 'pcs'
  },
  physicalLocation: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  brandName: {
    type: String,
    required: [true, 'Brand name is required']
  },
  isAllBranches: {
    type: Boolean,
    default: true
  },
  specificBranches: [String],
  sku: {
    type: String,
    unique: true,
    required: [true, 'SKU is required']
  },
  qrCode: {
    type: String, // Data URL or Cloudinary URL
    default: ''
  },
  image: {
    type: String, // Cloudinary URL
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Draft', 'Out of Stock', 'Low Stock'],
    default: 'Active'
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;
