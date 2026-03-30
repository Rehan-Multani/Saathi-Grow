import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  key: {
    type: String,
    trim: true,
    required: true
  },
  type: {
    type: String,
    enum: ['subcategory_grid', 'brand_strip', 'promo_banner', 'product_rail', 'view_more_cta'],
    required: true
  },
  title: {
    type: String,
    trim: true,
    default: ''
  },
  subtitle: {
    type: String,
    trim: true,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  imagePublicId: {
    type: String,
    default: ''
  },
  mobileImageUrl: {
    type: String,
    default: ''
  },
  mobileImagePublicId: {
    type: String,
    default: ''
  },
  ctaLabel: {
    type: String,
    default: ''
  },
  ctaLink: {
    type: String,
    default: ''
  },
  maxItems: {
    type: Number,
    default: 8
  },
  maxProducts: {
    type: Number,
    default: 10
  },
  brandIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand'
  }],
  subCategoryIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory'
  }],
  productIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, { _id: true });

const categoryPageSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
    index: true
  },
  theme: {
    pageBg: { type: String, default: '#f6fbf7' },
    heroBg: { type: String, default: '#eef8f0' },
    cardBg: { type: String, default: '#ffffff' },
    accent: { type: String, default: '#0c831f' },
    text: { type: String, default: '#111827' }
  },
  hero: {
    title: { type: String, trim: true, default: '' },
    subtitle: { type: String, trim: true, default: '' },
    bannerImage: { type: String, default: '' },
    bannerImagePublicId: { type: String, default: '' },
    mobileBannerImage: { type: String, default: '' },
    mobileBannerImagePublicId: { type: String, default: '' },
    sponsorLabel: { type: String, trim: true, default: '' },
    sponsorBrand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      default: null
    }
  },
  seo: {
    title: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    image: { type: String, default: '' },
    imagePublicId: { type: String, default: '' }
  },
  sections: [sectionSchema],
  publishedAt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  }
}, {
  timestamps: true
});

const CategoryPage = mongoose.model('CategoryPage', categoryPageSchema);

export default CategoryPage;
