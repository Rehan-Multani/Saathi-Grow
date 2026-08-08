import mongoose from 'mongoose';

const deliverySlotSchema = new mongoose.Schema({
  startTime: {
    type: String, // e.g., "09:00"
    required: true
  },
  endTime: {
    type: String, // e.g., "11:00"
    required: true
  },
  label: {
    type: String, // e.g., "Morning (9 AM - 11 AM)"
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxOrders: {
    type: Number,
    default: 50,
    min: 1,
    max: 1000
  }
}, {
  timestamps: true
});

const DeliverySlot = mongoose.model('DeliverySlot', deliverySlotSchema);
export default DeliverySlot;
