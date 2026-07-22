import DeliveryPartner from '../models/DeliveryPartner.js';
import generateToken from '../utils/generateToken.js';
import smsService from '../utils/smsService.js';
import { cloudinary } from '../config/cloudinary.js';

const pickFile = (files, field) => {
  if (files?.[field]?.[0]) return files[field][0];
  return null;
};

const applyUploadedDocs = async (partner, files, singleFile) => {
  const profileFile = pickFile(files, 'profileImage') || (singleFile || null);
  if (profileFile) {
    if (partner.profileImagePublicId) {
      try { await cloudinary.uploader.destroy(partner.profileImagePublicId); } catch (_) { /* ignore */ }
    }
    partner.profileImage = profileFile.path;
    partner.profileImagePublicId = profileFile.filename;
  }

  const docMap = [
    { field: 'aadhar', url: 'aadharImage', publicId: 'aadharImagePublicId' },
    { field: 'license', url: 'licenseImage', publicId: 'licenseImagePublicId' },
    { field: 'rc', url: 'rcImage', publicId: 'rcImagePublicId' },
  ];

  for (const { field, url, publicId } of docMap) {
    const file = pickFile(files, field);
    if (!file) continue;
    if (partner[publicId]) {
      try { await cloudinary.uploader.destroy(partner[publicId]); } catch (_) { /* ignore */ }
    }
    partner[url] = file.path;
    partner[publicId] = file.filename;
  }
};

// @desc    Register a new Delivery Partner (self-signup, pending admin approval)
// @route   POST /api/delivery/auth/register
// @access  Public
export const registerPartner = async (req, res) => {
  try {
    const { name, phone, email, city, vehicleType, vehicleNumber } = req.body;

    if (!name?.trim() || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }

    if (!city?.trim()) {
      return res.status(400).json({ message: 'Base location / city is required' });
    }

    if (!vehicleType?.trim()) {
      return res.status(400).json({ message: 'Vehicle type is required' });
    }

    const validVehicleTypes = ['Bike', 'EV', 'Cycle', 'Other'];
    if (!validVehicleTypes.includes(vehicleType)) {
      return res.status(400).json({ message: 'Invalid vehicle type' });
    }

    if (!vehicleNumber?.trim()) {
      return res.status(400).json({ message: 'Vehicle number is required' });
    }

    const vehicleRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;
    const normalizedVehicleNumber = vehicleNumber.trim().toUpperCase();
    if (!vehicleRegex.test(normalizedVehicleNumber)) {
      return res.status(400).json({ message: 'Vehicle number must be in format: MP09AB1234' });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Enter a valid 10-digit phone number' });
    }

    const aadharFile = pickFile(req.files, 'aadhar');
    const licenseFile = pickFile(req.files, 'license');
    if (!aadharFile || !licenseFile) {
      return res.status(400).json({ message: 'Aadhar card and Driving License uploads are required' });
    }

    const existing = await DeliveryPartner.findOne({ phone });
    if (existing) {
      return res.status(409).json({ message: 'An account with this phone number already exists' });
    }

    const partnerData = {
      name: name.trim(),
      phone,
      email: email?.trim().toLowerCase() || undefined,
      city: city.trim(),
      vehicleType: vehicleType.trim(),
      vehicleNumber: normalizedVehicleNumber,
      authStatus: 'Unverified',
      dutyStatus: 'Offline',
      assignmentStatus: 'Free',
      aadharImage: aadharFile.path,
      aadharImagePublicId: aadharFile.filename,
      licenseImage: licenseFile.path,
      licenseImagePublicId: licenseFile.filename,
    };

    const rcFile = pickFile(req.files, 'rc');
    if (rcFile) {
      partnerData.rcImage = rcFile.path;
      partnerData.rcImagePublicId = rcFile.filename;
    }

    const profileFile = pickFile(req.files, 'profileImage');
    if (profileFile) {
      partnerData.profileImage = profileFile.path;
      partnerData.profileImagePublicId = profileFile.filename;
    }

    const partner = await DeliveryPartner.create(partnerData);

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

    const testNumbers = ['9199818320', '9009925021', '6261096283', '9752275626', '7047716600', '9685974247', '8770620342'];
    const isTestNumber = testNumbers.includes(phone);

    const otp = isTestNumber ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    partner.otp = otp;
    partner.otpExpires = otpExpires;
    await partner.save();

    if (!isTestNumber) {
      await smsService.sendOTP(phone, otp);
    } else {
      console.log(`🧪 Test Partner Number Detected: ${phone} - Using default OTP: 123456`);
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 600,
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

// @desc    Update partner profile (including KYC docs)
// @route   PUT /api/delivery/auth/profile
// @access  Private (Partner)
export const updateProfile = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findById(req.partner._id);

    if (partner) {
      partner.name = req.body.name || partner.name;
      partner.email = req.body.email || partner.email;
      partner.phone = req.body.phone || partner.phone;
      if (req.body.city !== undefined) partner.city = req.body.city.trim();
      partner.vehicleNumber = req.body.vehicleNumber || partner.vehicleNumber;
      if (req.body.vehicleType) partner.vehicleType = req.body.vehicleType;

      await applyUploadedDocs(partner, req.files, req.file);

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

    const publicIds = [
      partner.profileImagePublicId,
      partner.aadharImagePublicId,
      partner.licenseImagePublicId,
      partner.rcImagePublicId,
    ].filter(Boolean);

    for (const publicId of publicIds) {
      try {
        await cloudinary.uploader.destroy(publicId);
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
