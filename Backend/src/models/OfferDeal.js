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
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  expiryDate: {
    type: Date
  },
  displayLocation: {
    type: String,
    enum: ['Home Slider', 'Category Page', 'N/A'],
    default: 'Home Slider'
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null
  },
  animationType: {
    type: String,
    enum: ['None', 'Default', 'Cleaning', 'Fruits', 'Vegetables', 'Staples', 'Snacks', 'Meat', 'Festive', 'Beverages', 'Bakery', 'BabyCare', 'PetCare', 'Beauty'],
    default: 'Default'
  },
  backgroundEffect: {
    type: String,
    enum: ['None', 'Confetti', 'Sparkles', 'Bubbles', 'Snow'],
    default: 'None'
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const OfferDeal = mongoose.model('OfferDeal', offerDealSchema);
export default OfferDeal;
