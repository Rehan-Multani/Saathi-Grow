import mongoose from 'mongoose';

const legalPageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  targetAudience: [{
    type: String,
    enum: ['User', 'Vendor', 'Delivery Partner', 'Staff', 'Store Manager'],
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Middleware to auto-generate slug from title if not provided
legalPageSchema.pre('validate', function (next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

const LegalPage = mongoose.model('LegalPage', legalPageSchema);
export default LegalPage;
