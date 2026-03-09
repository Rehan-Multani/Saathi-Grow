import FAQ from '../models/FAQ.js';

// @desc    Get all FAQs
// @route   GET /api/faqs
// @access  Public
export const getFAQs = async (req, res) => {
  try {
    const { category, status } = req.query;
    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    else if (!req.admin) query.status = 'Published'; // Users only see published

    const faqs = await FAQ.find(query).sort('displayOrder createdAt');
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new FAQ
// @route   POST /api/faqs
// @access  Private (Admin)
export const createFAQ = async (req, res) => {
  try {
    const { question, answer, category, status, displayOrder } = req.body;
    const faq = await FAQ.create({
      question,
      answer,
      category,
      status,
      displayOrder
    });
    res.status(201).json(faq);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update FAQ
// @route   PUT /api/faqs/:id
// @access  Private (Admin)
export const updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (faq) {
      faq.question = req.body.question || faq.question;
      faq.answer = req.body.answer || faq.answer;
      faq.category = req.body.category || faq.category;
      faq.status = req.body.status || faq.status;
      faq.displayOrder = req.body.displayOrder !== undefined ? req.body.displayOrder : faq.displayOrder;

      const updatedFAQ = await faq.save();
      res.json(updatedFAQ);
    } else {
      res.status(404).json({ message: 'FAQ not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete FAQ
// @route   DELETE /api/faqs/:id
// @access  Private (Admin)
export const deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (faq) {
      await faq.deleteOne();
      res.json({ message: 'FAQ removed' });
    } else {
      res.status(404).json({ message: 'FAQ not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
