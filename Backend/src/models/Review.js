import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Review must belong to a product']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user']
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating between 1 and 5'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please provide a comment'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  reply: {
    type: String,
    trim: true,
    maxlength: [500, 'Reply cannot exceed 500 characters']
  },
  replied: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// One user can only review a product once
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to calculate average ratings
reviewSchema.statics.calcAverageRatings = async function(productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId }
    },
    {
      $group: {
        _id: '$product',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      ratingCount: stats[0].nRating,
      averageRating: Math.round(stats[0].avgRating * 10) / 10
    });
  } else {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      ratingCount: 0,
      averageRating: 0
    });
  }
};

// Call calcAverageRatings after save
reviewSchema.post('save', function() {
  this.constructor.calcAverageRatings(this.product);
});

// Call calcAverageRatings before delete (using findOneAndDelete)
reviewSchema.post(/^findOneAnd/, async function(doc) {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.product);
  }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
