import Vendor from '../models/Vendor.js';
import generateToken from '../utils/generateToken.js';
import { cloudinary } from '../config/cloudinary.js';
import crypto from 'crypto';
import { sendResetPasswordEmail } from '../services/emailService.js';

// @desc    Vendor Login
// @route   POST /api/vendors/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const vendor = await Vendor.findOne({ email }).select('+password');

  if (!vendor || !(await vendor.correctPassword(password, vendor.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (vendor.status !== 'Active') {
    return res.status(403).json({ message: `Your account is ${vendor.status}. Please contact admin.` });
  }

  res.json({
    _id: vendor._id,
    storeName: vendor.storeName,
    ownerName: vendor.ownerName,
    email: vendor.email,
    phone: vendor.phone,
    address: vendor.address,
    description: vendor.description,
    logo: vendor.logo,
    status: vendor.status,
    token: generateToken(vendor._id)
  });
};

// @desc    Vendor Registration (Self-onboarding)
// @route   POST /api/vendors/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { storeName, ownerName, email, phone, password, address, description } = req.body;

    const vendorExists = await Vendor.findOne({ $or: [{ email }, { phone }] });
    if (vendorExists) {
      return res.status(400).json({ message: 'Vendor with this email or phone already exists' });
    }

    const vendor = await Vendor.create({
      storeName,
      ownerName,
      email,
      phone,
      password,
      address,
      description,
      status: 'Pending' // Always pending when self-registering
    });

    res.status(201).json({
      message: 'Registration successful! Your account is pending admin approval.',
      _id: vendor._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Vendor Profile
// @route   GET /api/vendors/profile
// @access  Private (Vendor)
export const getProfile = async (req, res) => {
  const vendor = await Vendor.findById(req.vendor._id);
  if (vendor) {
    res.json(vendor);
  } else {
    res.status(404).json({ message: 'Vendor not found' });
  }
};

// @desc    Update Vendor Profile
// @route   PUT /api/vendors/profile
// @access  Private (Vendor)
export const updateProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor._id);

    if (vendor) {
      vendor.storeName = req.body.storeName || vendor.storeName;
      vendor.ownerName = req.body.ownerName || vendor.ownerName;
      vendor.address = req.body.address || vendor.address;
      vendor.description = req.body.description || vendor.description;

      if (req.body.password) {
        vendor.password = req.body.password;
      }

      // Handling logo update if provided
      if (req.file) {
        // Use cloudinary if logo is updated via file upload
        vendor.logo = req.file.path;
      }

      const updatedVendor = await vendor.save();

      res.json({
        _id: updatedVendor._id,
        storeName: updatedVendor.storeName,
        ownerName: updatedVendor.ownerName,
        email: updatedVendor.email,
        phone: updatedVendor.phone,
        address: updatedVendor.address,
        description: updatedVendor.description,
        logo: updatedVendor.logo,
        status: updatedVendor.status,
        token: generateToken(updatedVendor._id)
      });
    } else {
      res.status(404).json({ message: 'Vendor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get vendor's saved bank account
// @route   GET /api/vendors/bank-account
// @access  Private (Vendor)
export const getBankAccount = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor._id).select('bankAccount');
    res.json({ bankAccount: vendor?.bankAccount || null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save/update vendor bank account (only one allowed)
// @route   PUT /api/vendors/bank-account
// @access  Private (Vendor)
export const saveBankAccount = async (req, res) => {
  try {
    const { accountHolderName, accountNumber, ifscCode, bankName, upiId } = req.body;

    // At minimum need either a UPI ID or full bank details
    if (!upiId && (!accountNumber || !ifscCode)) {
      return res.status(400).json({
        message: 'Provide either a UPI ID or full bank details (Account No. + IFSC)'
      });
    }

    const vendor = await Vendor.findById(req.vendor._id);
    vendor.bankAccount = {
      accountHolderName: accountHolderName || vendor.bankAccount?.accountHolderName || '',
      accountNumber: accountNumber || '',
      ifscCode: (ifscCode || '').toUpperCase(),
      bankName: bankName || '',
      upiId: upiId || '',
      addedAt: new Date()
    };
    await vendor.save();

    res.json({ success: true, bankAccount: vendor.bankAccount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete vendor bank account
// @route   DELETE /api/vendors/bank-account
// @access  Private (Vendor)
export const deleteBankAccount = async (req, res) => {
  try {
    await Vendor.findByIdAndUpdate(req.vendor._id, {
      $set: {
        'bankAccount.accountHolderName': '',
        'bankAccount.accountNumber': '',
        'bankAccount.ifscCode': '',
        'bankAccount.bankName': '',
        'bankAccount.upiId': '',
        'bankAccount.addedAt': null
      }
    });
    res.json({ success: true, message: 'Bank account removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vendor Forgot Password
// @route   POST /api/vendors/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const vendor = await Vendor.findOne({ email });
    if (!vendor) return res.status(404).json({ message: 'No vendor account found with this email' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    vendor.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    vendor.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await vendor.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.VENDOR_URL || 'http://localhost:5173'}/vendor/reset-password/${resetToken}`;
    const sent = await sendResetPasswordEmail(vendor.email, vendor.ownerName, resetUrl);

    if (sent) {
      res.json({ message: 'Password reset link sent to your email' });
    } else {
      vendor.resetPasswordToken = undefined;
      vendor.resetPasswordExpires = undefined;
      await vendor.save({ validateBeforeSave: false });
      res.status(500).json({ message: 'Failed to send email. Try again.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vendor Reset Password
// @route   POST /api/vendors/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const vendor = await Vendor.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!vendor) return res.status(400).json({ message: 'Invalid or expired reset token' });

    vendor.password = req.body.password;
    vendor.resetPasswordToken = undefined;
    vendor.resetPasswordExpires = undefined;
    await vendor.save();

    res.json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
