import CampaignSection from '../models/CampaignSection.js';

// @desc    Get all campaign sections
// @route   GET /api/admin/campaigns
// @access  Private (Admin/Staff)
export const getCampaignSections = async (req, res) => {
  try {
    const sections = await CampaignSection.find()
      .populate('products.productId', 'name image basePrice mrp sku')
      .sort('order');
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get campaign section by ID
// @route   GET /api/admin/campaigns/:id
// @access  Private (Admin/Staff)
export const getCampaignById = async (req, res) => {
  try {
    const section = await CampaignSection.findById(req.params.id)
      .populate('products.productId', 'name image basePrice mrp sku');
    if (!section) return res.status(404).json({ message: 'Campaign not found' });
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active campaign sections for frontend
// @route   GET /api/admin/campaigns/public  (served under /api/admin/campaigns)
// @access  Public
export const getActiveCampaignSections = async (req, res) => {
  try {
    const sections = await CampaignSection.find({ isActive: true })
      .populate('products.productId', 'name image basePrice mrp sku unitType unitValue category status')
      .sort('order');
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new campaign section
// @route   POST /api/admin/campaigns
// @access  Private (Admin)
export const createCampaignSection = async (req, res) => {
  try {
    const { title, subtitle, highlightText, bgColor, textColor, accentColor, products, order, displayType } = req.body;

    let parsedProducts = products;
    if (typeof products === 'string') {
      try {
        parsedProducts = JSON.parse(products);
      } catch (e) {
        parsedProducts = [];
      }
    }

    const section = await CampaignSection.create({
      title,
      subtitle,
      highlightText,
      bgColor,
      textColor,
      accentColor,
      displayType: displayType || 'festive',
      products: parsedProducts,
      order,
      bannerImage: req.file ? req.file.path : ''
    });

    const populatedSection = await section.populate('products.productId', 'name image basePrice mrp sku');
    res.status(201).json(populatedSection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a campaign section
// @route   PUT /api/admin/campaigns/:id
// @access  Private (Admin)
export const updateCampaignSection = async (req, res) => {
  try {
    const section = await CampaignSection.findById(req.params.id);

    if (!section) {
      return res.status(404).json({ message: 'Campaign section not found' });
    }

    const { title, subtitle, highlightText, bgColor, textColor, accentColor, products, order, isActive, displayType } = req.body;

    section.title = title || section.title;
    section.subtitle = subtitle !== undefined ? subtitle : section.subtitle;
    section.highlightText = highlightText || section.highlightText;
    section.bgColor = bgColor || section.bgColor;
    section.textColor = textColor || section.textColor;
    section.accentColor = accentColor || section.accentColor;
    section.isActive = isActive !== undefined ? isActive : section.isActive;
    section.order = order !== undefined ? order : section.order;
    if (displayType) section.displayType = displayType;

    if (products) {
      section.products = typeof products === 'string' ? JSON.parse(products) : products;
    }

    if (req.file) {
      section.bannerImage = req.file.path;
    }

    await section.save();
    const updated = await CampaignSection.findById(section._id).populate('products.productId', 'name image basePrice mrp sku');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a campaign section
// @route   DELETE /api/admin/campaigns/:id
// @access  Private (Admin)
export const deleteCampaignSection = async (req, res) => {
  try {
    const section = await CampaignSection.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    await section.deleteOne();
    res.json({ message: 'Section removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
