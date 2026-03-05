import OfferDeal from '../models/OfferDeal.js';
import Product from '../models/Product.js';

// @desc    Get all offer deals
// @route   GET /api/admin/offers
export const getOfferDeals = async (req, res) => {
  try {
    const offers = await OfferDeal.find()
      .populate('products.productId', 'name image basePrice mrp sku')
      .sort('order');
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get offer deal by ID
export const getOfferDealById = async (req, res) => {
  try {
    const offer = await OfferDeal.findById(req.params.id)
      .populate('products.productId', 'name image basePrice mrp sku');
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new offer deal
export const createOfferDeal = async (req, res) => {
  try {
    const { title, subtitle, description, bgColor, textColor, accentColor, products, order, expiryDate, displayLocation, discountPercentage } = req.body;

    let parsedProducts = products;
    if (typeof products === 'string') {
      try {
        parsedProducts = JSON.parse(products);
      } catch (e) {
        parsedProducts = [];
      }
    }

    if (parsedProducts && parsedProducts.length > 0) {
      for (const p of parsedProducts) {
        if (p.basePrice !== undefined) {
          await Product.findByIdAndUpdate(p.productId, { basePrice: p.basePrice });
        }
      }
    }

    const offer = await OfferDeal.create({
      title,
      subtitle,
      description,
      bgColor,
      textColor,
      accentColor,
      products: parsedProducts,
      order,
      expiryDate,
      displayLocation,
      discountPercentage: discountPercentage || 0,
      bannerImage: req.file ? req.file.path : ''
    });

    const populatedOffer = await offer.populate('products.productId', 'name image basePrice mrp sku');
    res.status(201).json(populatedOffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an offer deal
export const updateOfferDeal = async (req, res) => {
  try {
    const offer = await OfferDeal.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: 'Offer deal not found' });
    }

    const { title, subtitle, description, bgColor, textColor, accentColor, products, order, isActive, expiryDate, displayLocation, discountPercentage } = req.body;

    offer.title = title || offer.title;
    offer.subtitle = subtitle !== undefined ? subtitle : offer.subtitle;
    offer.description = description !== undefined ? description : offer.description;
    offer.bgColor = bgColor || offer.bgColor;
    offer.textColor = textColor || offer.textColor;
    offer.accentColor = accentColor || offer.accentColor;
    offer.isActive = isActive !== undefined ? isActive : offer.isActive;
    offer.order = order !== undefined ? order : offer.order;
    offer.expiryDate = expiryDate || offer.expiryDate;
    offer.displayLocation = displayLocation || offer.displayLocation;
    offer.discountPercentage = discountPercentage !== undefined ? discountPercentage : offer.discountPercentage;

    if (products) {
      const parsedProducts = typeof products === 'string' ? JSON.parse(products) : products;
      offer.products = parsedProducts;

      if (parsedProducts && parsedProducts.length > 0) {
        for (const p of parsedProducts) {
          if (p.basePrice !== undefined) {
            await Product.findByIdAndUpdate(p.productId, { basePrice: p.basePrice });
          }
        }
      }
    }

    if (req.file) {
      offer.bannerImage = req.file.path;
    }

    await offer.save();
    const updated = await OfferDeal.findById(offer._id).populate('products.productId', 'name image basePrice mrp sku');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an offer deal
export const deleteOfferDeal = async (req, res) => {
  try {
    const offer = await OfferDeal.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    await offer.deleteOne();
    res.json({ message: 'Offer removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active offer deals for public
export const getActiveOfferDeals = async (req, res) => {
  try {
    const { storeId, storeType } = req.query;

    const offers = await OfferDeal.find({ isActive: true })
      .populate('products.productId', 'name image basePrice mrp sku unitType unitValue status isVeg branchStocks vendor')
      .sort('order');

    if (storeId && storeType) {
      const formattedOffers = offers.map(offer => {
        const offerObj = offer.toObject();
        offerObj.products = offerObj.products.map(cp => {
          if (!cp.productId) return cp;

          let isDeliverable = false;
          const pObj = cp.productId;

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

          cp.productId.isDeliverable = isDeliverable;
          return cp;
        });
        return offerObj;
      });
      return res.json(formattedOffers);
    }

    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
