import Vendor from '../models/Vendor.js';
import VendorPayout from '../models/VendorPayout.js';
import { cloudinary } from '../config/cloudinary.js';

// @desc    Get all vendors
// @route   GET /api/admin/vendors
// @access  Private (Admin/Staff)
export const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vendor by ID
// @route   GET /api/admin/vendors/:id
// @access  Private (Admin/Staff)
export const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new vendor
// @route   POST /api/admin/vendors
// @access  Private (Admin/Staff)
export const createVendor = async (req, res) => {
  try {
    const { storeName, ownerName, email, phone, address, description, status, password } = req.body;

    let parsedAddress = address;
    if (typeof address === 'string') {
      try {
        parsedAddress = JSON.parse(address);
      } catch (err) {
        return res.status(400).json({ message: 'Invalid address format' });
      }
    }

    const vendorExists = await Vendor.findOne({ email });
    if (vendorExists) {
      return res.status(400).json({ message: 'Vendor with this email already exists' });
    }

    let logo = '';
    if (req.file) {
      logo = req.file.path;
    }

    const vendor = await Vendor.create({
      storeName,
      ownerName,
      email,
      phone,
      address: parsedAddress,
      description,
      status: status || 'Pending',
      password: password || '123456', // Default password if not provided
      logo,
      createdBy: req.admin._id
    });

    res.status(201).json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update vendor
// @route   PUT /api/admin/vendors/:id
// @access  Private (Admin/Staff)
export const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    const { storeName, ownerName, email, phone, address, description, status } = req.body;

    let parsedAddress = address;
    if (address && typeof address === 'string') {
      try {
        parsedAddress = JSON.parse(address);
      } catch (err) {
        // Fallback or ignore if not JSON
      }
    }

    vendor.storeName = storeName || vendor.storeName;
    vendor.ownerName = ownerName || vendor.ownerName;
    vendor.email = email || vendor.email;
    vendor.phone = phone || vendor.phone;
    vendor.address = parsedAddress || vendor.address;
    vendor.description = description || vendor.description;
    vendor.status = status || vendor.status;

    if (req.file) {
      vendor.logo = req.file.path;
    }

    const updatedVendor = await vendor.save();
    res.json(updatedVendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete vendor
// @route   DELETE /api/admin/vendors/:id
// @access  Private (Admin)
export const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    await vendor.deleteOne();
    res.json({ message: 'Vendor removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all payouts
// @route   GET /api/admin/vendors/payouts
// @access  Private (Admin/Staff)
export const getPayouts = async (req, res) => {
  try {
    const payouts = await VendorPayout.find({})
      .populate('vendor', 'storeName ownerName logo')
      .populate('processedBy', 'name email')
      .sort('-createdAt');
    res.json(payouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a payout
// @route   POST /api/admin/vendors/payouts
// @access  Private (Admin)
export const createPayout = async (req, res) => {
  try {
    const { vendor, amount, paymentMethod, referenceNumber, note, status } = req.body;

    const payout = await VendorPayout.create({
      vendor,
      amount,
      paymentMethod,
      referenceNumber,
      note,
      status: status || 'Processing',
      processedBy: req.admin._id
    });

    const populatedPayout = await VendorPayout.findById(payout._id)
      .populate('vendor', 'storeName ownerName logo');

    res.status(201).json(populatedPayout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update payout status
// @route   PATCH /api/admin/vendors/payouts/:id
// @access  Private (Admin)
export const updatePayoutStatus = async (req, res) => {
  try {
    const { status, referenceNumber, note } = req.body;
    const payout = await VendorPayout.findById(req.params.id);

    if (payout) {
      payout.status = status || payout.status;
      payout.referenceNumber = referenceNumber || payout.referenceNumber;
      payout.note = note || payout.note;

      const updatedPayout = await payout.save();
      const populatedPayout = await VendorPayout.findById(updatedPayout._id)
        .populate('vendor', 'storeName ownerName logo');

      res.json(populatedPayout);
    } else {
      res.status(404).json({ message: 'Payout not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
