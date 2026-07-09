import User from '../models/User.js';

const extractProductObjectId = (item) => {
  const source = item?.productId || item?.id || item?._id || item?.product;
  if (!source) return null;
  const raw = String(source);
  const candidate = raw.includes('::') ? raw.split('::')[0] : raw;
  return candidate;
};

const toCartResponseItem = (item) => {
  const product = item.product;
  if (!product) return null;

  const variantValue = item.selectedVariant?.value;
  const variant = variantValue
    ? (product.variants || []).find(v => v?.value === variantValue)
    : null;
  const variantPrice = variant?.price;
  const basePrice = product.basePrice || product.price || 0;
  const resolvedPrice = item.price ?? variantPrice ?? basePrice;
  const resolvedWeight = item.weight || variantValue || `${product.unitValue || ''} ${product.unitType || ''}`.trim();
  const resolvedName = item.displayName || (variantValue ? `${product.name} (${variantValue})` : product.name);
  const responseId = variantValue ? `${product._id}::${variantValue}` : String(product._id);

  return {
    ...product._doc,
    id: responseId,
    _id: product._id,
    productId: product._id,
    quantity: item.quantity,
    price: resolvedPrice,
    weight: resolvedWeight,
    name: resolvedName,
    selectedVariant: item.selectedVariant?.value ? item.selectedVariant : null
  };
};

// @desc    Get user cart
// @route   GET /api/user/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product', 'name image basePrice mrp unitType unitValue category status isVeg variants');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out invalid products (e.g. if product was deeply deleted)
    const validCart = user.cart.filter(item => item.product);

    // Normalize format for frontend
    const cartFormat = validCart.map(toCartResponseItem).filter(Boolean);

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
    // Replace the backend cart entirely with the newly synced frontend array.
    const cart = (cartItems || []).map(item => {
      const productId = extractProductObjectId(item);
      return {
        product: productId,
        selectedVariant: item.selectedVariant?.value ? {
          type: item.selectedVariant.type || '',
          value: item.selectedVariant.value
        } : undefined,
        price: Number.isFinite(Number(item.price)) ? Number(item.price) : null,
        displayName: item.name || '',
        weight: item.weight || '',
        quantity: item.quantity
      };
    }).filter(item => item.product);

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { cart } },
      { new: true, runValidators: true }
    ).populate('cart.product', 'name image basePrice mrp unitType unitValue category status isVeg variants');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    const validCart = updatedUser.cart.filter(item => item.product);
    const cartFormat = validCart.map(toCartResponseItem).filter(Boolean);

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
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { cart: [] } },
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Cart cleared successfully', cart: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
