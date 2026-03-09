import mongoose from 'mongoose';

const globalSettingSchema = new mongoose.Schema({
  // Tax Settings
  organizationTIN: { type: String, default: 'GST29AABCS1234Z' },
  taxIdType: { type: String, default: 'GST (India)' },
  defaultTaxRate: { type: Number, default: 18 },
  taxCalculation: { type: String, enum: ['Exclusive', 'Inclusive'], default: 'Exclusive' },

  // Delivery & App Fees
  baseDeliveryFee: { type: Number, default: 25 },
  freeDeliveryThreshold: { type: Number, default: 500 },
  handlingFee: { type: Number, default: 5 },
  surgeMultiplier: { type: Number, default: 1.0 },

  // Business Logic
  platformCommissionRate: { type: Number, default: 12 }, // Vendor split
  platformWalletBalance: { type: Number, default: 45280.50 }, // Track platform earnings
  maxDeliveryRadius: { type: Number, default: 20 }, // in KM
  autoInvoicingEnabled: { type: Boolean, default: true },

  // Support Settings
  supportPhone: { type: String, default: '+91 911 110 5005' },
  whatsappNumber: { type: String, default: '919111105005' },
  supportEmail: { type: String, default: 'support@sathigro.com' }
}, {
  timestamps: true
});

const GlobalSetting = mongoose.model('GlobalSetting', globalSettingSchema);
export default GlobalSetting;
