import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientModel'
  },
  recipientModel: {
    type: String,
    required: true,
    enum: ['User', 'Admin', 'Vendor', 'DeliveryPartner', 'Staff']
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  data: {
    type: Map,
    of: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'general'
  }
}, {
  timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
