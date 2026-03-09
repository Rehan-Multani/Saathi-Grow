import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Orders', 'Account', 'Shipping', 'Payment', 'General'],
    default: 'General'
  },
  status: {
    type: String,
    enum: ['Published', 'Draft'],
    default: 'Published'
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const FAQ = mongoose.model('FAQ', faqSchema);
export default FAQ;
