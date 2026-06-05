import GlobalSetting from '../models/GlobalSetting.js';

// @desc    Get Global Settings
// @route   GET /api/admin/settings
// @access  Private (Admin only)
export const getSettings = async (req, res) => {
  try {
    let settings = await GlobalSetting.findOne();

    // Auto-initialize if they don't exist yet
    if (!settings) {
      settings = await GlobalSetting.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

// @desc    Update Global Settings
// @route   PUT /api/admin/settings
// @access  Private (Admin only)
export const updateSettings = async (req, res) => {
  try {
    let settings = await GlobalSetting.findOne();
    if (!settings) {
      settings = new GlobalSetting();
    }

    // Direct updates (only allow safe fields)
    const updates = req.body;

    // Prevent manual override of the platformWalletBalance from this general settings endpoint
    delete updates.platformWalletBalance;

    Object.assign(settings, updates);

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
};

// @desc    Public interface to get active charges for checkout
// @route   GET /api/settings/public
// @access  Public
export const getPublicSettings = async (req, res) => {
  try {
    let settings = await GlobalSetting.findOne();
    if (!settings) {
      settings = await GlobalSetting.create({});
    }

    // Expose ONLY safe values to the frontend
    res.json({
      defaultTaxRate: settings.defaultTaxRate,
      taxCalculation: settings.taxCalculation,
      baseDeliveryFee: settings.baseDeliveryFee,
      freeDeliveryThreshold: settings.freeDeliveryThreshold,
      handlingFee: settings.handlingFee,
      surgeMultiplier: settings.surgeMultiplier,
      maxDeliveryRadius: settings.maxDeliveryRadius,
      supportPhone: settings.supportPhone,
      whatsappNumber: settings.whatsappNumber,
      supportEmail: settings.supportEmail,
      facebookUrl: settings.facebookUrl,
      instagramUrl: settings.instagramUrl,
      twitterUrl: settings.twitterUrl,
      linkedinUrl: settings.linkedinUrl,
      officialWebsite: settings.officialWebsite,
      offerStripText: settings.offerStripText,
      isOfferStripEnabled: settings.isOfferStripEnabled
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching public settings', error: error.message });
  }
};
