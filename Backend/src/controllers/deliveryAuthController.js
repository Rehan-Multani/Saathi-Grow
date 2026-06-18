import DeliveryPartner from '../models/DeliveryPartner.js';
import generateToken from '../utils/generateToken.js';
import smsService from '../utils/smsService.js';
import { cloudinary } from '../config/cloudinary.js';

// @desc    Register a new Delivery Partner (self-signup, pending admin approval)
// @route   POST /api/delivery/auth/register
// @access  Public
export const registerPartner = async (req, res) => {
  try {
    const { name, phone, email, vehicleType, vehicleNumber } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Enter a valid 10-digit phone number' });
    }

    const existing = await DeliveryPartner.findOne({ phone });
    if (existing) {
      return res.status(409).json({ message: 'An account with this phone number already exists' });
    }

    const partner = await DeliveryPartner.create({
      name: name.trim(),
      phone,
      email: email?.trim().toLowerCase() || undefined,
      vehicleType: vehicleType || 'Bike',
      vehicleNumber: vehicleNumber?.trim().toUpperCase() || undefined,
      authStatus: 'Unverified',
      dutyStatus: 'Offline',
      assignmentStatus: 'Free',
    });

    res.status(201).json({
      success: true,
      message: 'Registration submitted! Your account is under review. You will be notified once approved.',
      partner: {
        _id: partner._id,
        name: partner.name,
        phone: partner.phone,
        uniqueId: partner.uniqueId,
        authStatus: partner.authStatus,
      },
    });
  } catch (error) {
    console.error('Register Partner Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Request OTP for Delivery Partner Login
// @route   POST /api/delivery/auth/request-otp
// @access  Public
export const requestOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const partner = await DeliveryPartner.findOne({ phone });

    if (!partner) {
      return res.status(404).json({ message: 'Delivery Partner account not found. Please register first then login.' });
    }

    if (partner.authStatus !== 'Active') {
      return res.status(403).json({ message: `Your account is ${partner.authStatus}. Please contact support at support@saathigro.in.` });
    }

    // TEST NUMBERS - Bypass OTP with default 123456
    const testNumbers = ['9199818320', '9009925021', '6261096283', '9752275626', '7047716600', '9685974247', '8770620342'];
    const isTestNumber = testNumbers.includes(phone);

    // Generate 6-digit OTP
    const otp = isTestNumber ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    partner.otp = otp;
    partner.otpExpires = otpExpires;
    await partner.save();

    // Send SMS only for non-test numbers
    if (!isTestNumber) {
      await smsService.sendOTP(phone, otp);
    } else {
      console.log(`🧪 Test Partner Number Detected: ${phone} - Using default OTP: 123456`);
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 600,
      otp: process.env.NODE_ENV === 'development' || isTestNumber ? otp : undefined
    });
  } catch (error) {
    console.error('Request OTP Error:', error);
    res.status(500).json({ message: 'Server error sending OTP' });
  }
};

// @desc    Verify OTP and Login
// @route   POST /api/delivery/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const partner = await DeliveryPartner.findOne({ phone }).select('+otp +otpExpires');

    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    const testNumbers = ['8770620342', '9199818320', '9009925021', '6261096283', '9752275626', '7047716600', '9685974247'];
    const isTestNumber = testNumbers.includes(phone);

    if (isTestNumber && otp === '123456') {
      // Test number bypass
      console.log(`🧪 Test Partner Login: ${phone}`);
    } else {
      if (!partner.otp || partner.otp !== otp) {
        return res.status(401).json({ message: 'Invalid OTP' });
      }

      if (partner.otpExpires < Date.now()) {
        return res.status(401).json({ message: 'OTP has expired' });
      }
    }

    partner.otp = undefined;
    partner.otpExpires = undefined;
    await partner.save();

    res.json({
      success: true,
      message: 'Login successful',
      partner: {
        _id: partner._id,
        name: partner.name,
        phone: partner.phone,
        uniqueId: partner.uniqueId,
        vehicleType: partner.vehicleType,
        vehicleNumber: partner.vehicleNumber,
        profileImage: partner.profileImage,
        dutyStatus: partner.dutyStatus,
        assignmentStatus: partner.assignmentStatus,
        cashInHand: partner.cashInHand || 0
      },
      token: generateToken(partner._id)
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Server error verifying OTP' });
  }
};

// @desc    Get partner profile
// @route   GET /api/delivery/auth/profile
// @access  Private (Partner)
export const getProfile = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findById(req.partner._id);

    if (partner) {
      res.json({
        success: true,
        partner
      });
    } else {
      res.status(404).json({ message: 'Partner not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change partner password
// @route   PUT /api/delivery/auth/change-password
// @access  Private (Partner)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const partner = await DeliveryPartner.findById(req.partner._id).select('+password');

    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    const isMatch = await partner.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    partner.password = newPassword;
    await partner.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// @access  Private (Partner)
export const updateProfile = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findById(req.partner._id);

    if (partner) {
      partner.name = req.body.name || partner.name;
      partner.email = req.body.email || partner.email;
      partner.vehicleNumber = req.body.vehicleNumber || partner.vehicleNumber;

      if (req.file) {
        if (partner.profileImagePublicId) {
          await cloudinary.uploader.destroy(partner.profileImagePublicId);
        }
        partner.profileImage = req.file.path;
        partner.profileImagePublicId = req.file.filename;
      }

      const updatedPartner = await partner.save();
      res.json({
        success: true,
        message: 'Profile updated successfully',
        partner: updatedPartner
      });
    } else {
      res.status(404).json({ message: 'Partner not found' });
    }
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: error.message || 'Server error updating profile' });
  }
};

// @desc    Delete delivery partner profile (account deletion)
// @route   DELETE /api/delivery/auth/profile
// @access  Private (Partner)
export const deleteProfile = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findById(req.partner._id);
    if (!partner) {
      return res.status(404).json({ message: 'Delivery Partner not found' });
    }

    // Delete profile image from cloudinary if exists
    if (partner.profileImagePublicId) {
      try {
        await cloudinary.uploader.destroy(partner.profileImagePublicId);
      } catch (err) {
        console.error('Error deleting image from Cloudinary:', err);
      }
    }

    await DeliveryPartner.findByIdAndDelete(req.partner._id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete Profile Error:', error);
    res.status(500).json({ message: 'Server error deleting account' });
  }
};

