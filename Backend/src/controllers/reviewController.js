import Review from '../models/Review.js';
import Product from '../models/Product.js';

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ product: productId })
        .populate('user', 'name')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ product: productId })
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private (User)
export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ product: productId, user: req.user._id });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      comment
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews for a vendor's products
// @route   GET /api/vendor/reviews
// @access  Private (Vendor)
export const getVendorReviews = async (req, res) => {
  try {
    // Find all products belonging to this vendor
    const products = await Product.find({ vendor: req.vendor._id }).select('_id');
    const productIds = products.map(p => p._id);

    const reviews = await Review.find({ product: { $in: productIds } })
      .populate('user', 'name')
      .populate('product', 'name image')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reply to a review
// @route   PATCH /api/vendor/reviews/:id/reply
// @access  Private (Vendor)
export const replyToReview = async (req, res) => {
  try {
    const { reply } = req.body;
    const review = await Review.findById(req.params.id).populate('product');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if this review belongs to the vendor's product
    if (review.product.vendor.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reply to this review' });
    }

    review.reply = reply;
    review.replied = true;
    await review.save();

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
