import mongoose from 'mongoose';

const campaignSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Campaign title is required'],
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  highlightText: {
    type: String,
    trim: true,
    default: 'Limited Time Offer!'
  },
  // Controls how this campaign renders on the user frontend
  displayType: {
    type: String,
    enum: ['festive', 'lowest_prices'],
    default: 'festive'
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
    default: '#22c55e' // Tailwind green-500
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
  bannerImage: {
    type: String // Optional banner for the section
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null
  }
}, {
  timestamps: true
});

const CampaignSection = mongoose.model('CampaignSection', campaignSectionSchema);
export default CampaignSection;
