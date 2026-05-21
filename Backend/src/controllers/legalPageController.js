import LegalPage from '../models/LegalPage.js';

// @desc    Get all legal pages for Admin
// @route   GET /api/legal/admin
// @access  Private (Admin)
export const getLegalPagesForAdmin = async (req, res) => {
  try {
    const pages = await LegalPage.find().sort('-updatedAt');
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new legal page
// @route   POST /api/legal/admin
// @access  Private (Admin)
export const createLegalPage = async (req, res) => {
  try {
    const { title, slug, content, targetAudience, isActive } = req.body;

    // Check if slug exists
    const existingPage = await LegalPage.findOne({ slug });
    if (existingPage) {
      return res.status(400).json({ message: 'A page with this slug already exists' });
    }

    const page = await LegalPage.create({
      title,
      slug,
      content,
      targetAudience,
      isActive,
      lastUpdatedBy: req.admin._id
    });

    res.status(201).json(page);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update legal page
// @route   PUT /api/legal/admin/:id
// @access  Private (Admin)
export const updateLegalPage = async (req, res) => {
  try {
    const { title, slug, content, targetAudience, isActive } = req.body;
    const page = await LegalPage.findById(req.params.id);

    if (page) {
      page.title = title || page.title;
      page.slug = slug || page.slug;
      page.content = content || page.content;
      page.targetAudience = targetAudience || page.targetAudience;
      page.isActive = isActive !== undefined ? isActive : page.isActive;
      page.lastUpdatedBy = req.admin._id;

      const updatedPage = await page.save();
      res.json(updatedPage);
    } else {
      res.status(404).json({ message: 'Page not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete legal page
// @route   DELETE /api/legal/admin/:id
// @access  Private (Admin)
export const deleteLegalPage = async (req, res) => {
  try {
    const page = await LegalPage.findById(req.params.id);
    if (page) {
      await page.deleteOne();
      res.json({ message: 'Page deleted successfully' });
    } else {
      res.status(404).json({ message: 'Page not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get legal page by slug and audience
// @route   GET /api/legal/:slug
// @access  Public
export const getLegalPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { audience } = req.query; // e.g. ?audience=User

    const query = { slug, isActive: true };
    if (audience) {
      // Decode audience if URL encoded, e.g. 'Store%20Manager' -> 'Store Manager'
      const decodedAudience = decodeURIComponent(audience);
      query.targetAudience = {
        $in: [
          new RegExp(`^${decodedAudience.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i'),
          decodedAudience
        ]
      };
    }

    const page = await LegalPage.findOne(query);
    if (page) {
      res.json(page);
    } else {
      res.status(404).json({ message: 'Legal page not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get list of legal pages for specific audience
// @route   GET /api/legal/list/:audience
// @access  Public
export const getLegalPagesByAudience = async (req, res) => {
  try {
    const { audience } = req.params;
    const decodedAudience = decodeURIComponent(audience);

    const pages = await LegalPage.find({
      targetAudience: {
        $in: [
          new RegExp(`^${decodedAudience.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i'),
          decodedAudience
        ]
      },
      isActive: true
    }).select('title slug updatedAt');

    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
