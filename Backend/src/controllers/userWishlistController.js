import User from '../models/User.js';
import Product from '../models/Product.js';

// @desc    Get user wishlist
// @route   GET /api/user/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const { storeId, storeType } = req.query;

    const user = await User.findById(req.user._id).populate('wishlist', 'name image basePrice mrp unitType unitValue category status isVeg inventory');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let wishlist = user.wishlist || [];

    // Inject isDeliverable if store context provided
    if (storeId && storeType) {
      wishlist = wishlist.map(p => {
        const pObj = p.toObject();
        let isDeliverable = false;

        if (storeType === 'branch') {
          const branchStock = pObj.branchStocks?.find(bs => {
            const bId = bs.branchId?._id || bs.branchId;
            return bId && bId.toString() === storeId.toString();
          });
          if (branchStock && branchStock.stock > 0) {
            isDeliverable = true;
          }
        } else if (storeType === 'vendor') {
          const vId = pObj.vendor?._id || pObj.vendor;
          if (vId && vId.toString() === storeId.toString()) {
            isDeliverable = true;
          }
        }

        pObj.isDeliverable = isDeliverable;
        return pObj;
      });
    }

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/user/wishlist/:productId
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if valid product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    const updatedUser = await User.findById(req.user._id).populate('wishlist', 'name image basePrice mrp unitType unitValue category status isVeg');
    res.json(updatedUser.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/user/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();

    const updatedUser = await User.findById(req.user._id).populate('wishlist', 'name image basePrice mrp unitType unitValue category status isVeg');
    res.json({ message: 'Removed from wishlist', wishlist: updatedUser.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
