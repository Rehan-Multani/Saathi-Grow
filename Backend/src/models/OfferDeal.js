import mongoose from 'mongoose';

const offerDealSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Offer title is required'],
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  bannerImage: {
    type: String,
    required: [true, 'Banner image is required']
  },
  bgColor: {
    type: String,
    default: '#ffffff'
  },
  textColor: {
    type: String,
    default: '#000000'
  },
  accentColor: {
    type: String,
    default: '#22c55e'
  },
  discountPercentage: {
    type: Number,
    default: 0
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    dealPrice: {
      type: Number,
      required: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  expiryDate: {
    type: Date
  },
  order: {
    type: Number,
    default: 0
  },
  displayLocation: {
    type: String,
    enum: ['Home Slider', 'Category Page', 'N/A'],
    default: 'Home Slider'
  }
}, {
  timestamps: true
});

const OfferDeal = mongoose.model('OfferDeal', offerDealSchema);
export default OfferDeal;
