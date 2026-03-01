import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    // Can be a Vendor or a Branch depending on the order
    refPath: 'storeModel',
    required: true
  },
  storeModel: {
    type: String,
    required: true,
    enum: ['Vendor', 'Branch']
  },
  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryPartner',
    default: null
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Missing Item',
      'Damaged Goods',
      'Poor Quality',
      'Payment Issue',
      'Late Delivery',
      'Wrong Item',
      'Other'
    ]
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  description: {
    type: String,
    required: true
  },
  attachments: [{
    type: String // URLs for images
  }],
  status: {
    type: String,
    enum: ['OPEN', 'ESCALATED_TO_STORE', 'STORE_RESPONDED', 'RESOLVED', 'CLOSED'],
    default: 'OPEN'
  },
  resolutionThread: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'resolutionThread.senderModel'
    },
    senderModel: {
      type: String,
      required: true,
      enum: ['User', 'Admin', 'Vendor', 'Branch', 'DeliveryPartner']
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  adminNotes: String,
  storeNotes: String,
  resolutionSolution: String,
  slaExpiry: {
    type: Date
  },
  resolvedAt: Date,
  closedAt: Date
}, {
  timestamps: true
});

// Auto-generate Ticket ID before saving
complaintSchema.pre('save', async function (next) {
  if (!this.ticketId) {
    const count = await mongoose.model('Complaint').countDocuments();
    this.ticketId = `TKT-${1000 + count + 1}`;
  }
  // Set SLA Expiry to 4 hours from now by default if not set
  if (!this.slaExpiry && this.status === 'ESCALATED_TO_STORE') {
    this.slaExpiry = new Date(Date.now() + 4 * 60 * 60 * 1000);
  }
  next();
});

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;
