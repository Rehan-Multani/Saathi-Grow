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
  stockQuantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    default: 0
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
  image: {
    type: String, // Cloudinary URL
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Draft', 'Out of Stock'],
    default: 'Active'
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
