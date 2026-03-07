import User from '../models/User.js';

// @desc    Get user cart
// @route   GET /api/user/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product', 'name image basePrice mrp unitType unitValue category status isVeg');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out invalid products (e.g. if product was deeply deleted)
    const validCart = user.cart.filter(item => item.product);

    // Normalize format for frontend
    const cartFormat = validCart.map(item => ({
      ...item.product._doc,
      id: item.product._id,
      quantity: item.quantity
    }));

    res.json(cartFormat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sync cart from local storage arrays to MongoDB
// @route   POST /api/user/cart/sync
// @access  Private
export const syncCart = async (req, res) => {
  try {
    const { cartItems } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!cartItems || !Array.isArray(cartItems)) {
      return res.status(400).json({ message: 'Invalid cart format' });
    }

    // Replace the backend cart entirely with the newly synced frontend array.
    user.cart = cartItems.map(item => ({
      product: item.id || item._id,
      quantity: item.quantity
    }));

    await user.save();

    const updatedUser = await User.findById(req.user._id).populate('cart.product', 'name image basePrice mrp unitType unitValue category status isVeg');
    const validCart = updatedUser.cart.filter(item => item.product);
    const cartFormat = validCart.map(item => ({
      ...item.product._doc,
      id: item.product._id,
      quantity: item.quantity
    }));

    res.json(cartFormat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear user cart entirely
// @route   DELETE /api/user/cart
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.cart = [];
    await user.save();
    res.json({ message: 'Cart cleared successfully', cart: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
