import User from '../models/User.js';
import Otp from '../models/Otp.js';
import generateToken from '../utils/generateToken.js';
import smsService from '../utils/smsService.js';
import { cloudinary } from '../config/cloudinary.js';
import Order from '../models/Order.js';
import { sendPushNotification } from '../services/notificationService.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import { ensureUserReferralCode } from '../utils/generateReferralCode.js';
// @desc    Request OTP for Login/Register
// @route   POST /api/auth/request-otp
// @access  Public
export const requestOTP = async (req, res) => {
  try {
    const { phone, type } = req.body; // type: 'login' or 'register'

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    if (phone.length !== 10) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit phone number' });
    }

    const user = await User.findOne({ phone });

    if (type === 'login' && !user) {
      return res.status(404).json({ message: 'Account not found. Please register first.', requiresRegistration: true });
    }

    // SECURITY SHIELD: Prevent blocked users from requesting OTP
    if (user && user.isActive === false) {
      return res.status(403).json({
        message: 'Your account has been deactivated. Please contact support at support@saathigro.in to re-activate your account.'
      });
    }

    if (type === 'register' && user) {
      return res.status(409).json({ message: 'User already exists with this phone number. Please login instead.', requiresLogin: true });
    }

    // TEST NUMBERS - Bypass OTP with default 123456
    const testNumbers = ['8770620342', '9199818320', '9009925021', '6261096283', '9752275626', '7047716600', '9685974247'];
    const isTestNumber = testNumbers.includes(phone);

    // Generate 6-digit OTP
    const otp = isTestNumber ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // If user exists, update user doc. Else store in Otp collection
    if (user) {
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      await Otp.findOneAndUpdate(
        { phone },
        { phone, otp, expiresAt: otpExpires, tempData: { type: 'register' } },
        { upsert: true, new: true }
      );
    }

    // Send SMS only for non-test numbers
    if (!isTestNumber) {
      await smsService.sendOTP(phone, otp);
    } else {
      console.log(`🧪 Test Number Detected: ${phone} - Using default OTP: 123456`);
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 600, // 10 minutes
      // In development, we can return OTP
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('Request OTP Error:', error);
    res.status(500).json({ message: 'Server error sending OTP' });
  }
};

// @desc    Verify OTP and Login/Register
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp, name, email, referralCode: incomingReferral } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    let user = await User.findOne({ phone }).select('+otp +otpExpires');
    let isNewUser = false;

    if (user) {
      // Login Flow
      if (!user.otp || user.otp !== otp) {
        return res.status(401).json({ message: 'Invalid OTP' });
      }
      if (user.otpExpires < Date.now()) {
        return res.status(401).json({ message: 'OTP has expired' });
      }

      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      await ensureUserReferralCode(user);
    } else {
      // Register Flow
      const otpRecord = await Otp.findOne({ phone });
      if (!otpRecord) {
        return res.status(401).json({ message: 'Invalid request or OTP expired' });
      }
      if (otpRecord.otp !== otp) {
        return res.status(401).json({ message: 'Invalid OTP' });
      }
      if (otpRecord.expiresAt < Date.now()) {
        return res.status(401).json({ message: 'OTP has expired' });
      }

      if (name) {
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!nameRegex.test(name.trim())) {
          return res.status(400).json({ message: 'Full name should only contain letters and spaces, without numbers or special characters' });
        }
      }

      let referredBy = null;
      if (incomingReferral && String(incomingReferral).trim()) {
        const referrer = await User.findOne({
          referralCode: String(incomingReferral).trim().toUpperCase()
        }).select('_id');
        if (referrer) {
          referredBy = referrer._id;
        }
      }

      // Create user
      user = new User({
        phone,
        name: name || 'New Saathi',
        email: email || undefined,
        isActive: true,
        referredBy
      });
      isNewUser = true;
      await user.save();
      await ensureUserReferralCode(user);
      await Otp.deleteOne({ phone });

      // --- Production Welcome Flow ---
      const welcomeTitle = 'Welcome to Saathi-Grow! 🏮';
      const welcomeBody = `Hi ${user.name}, thank you for joining us. Enjoy fresh products delivered to your doorstep.`;

      // 1. Send Push Notification
      sendPushNotification(user._id, 'User', {
        title: welcomeTitle,
        body: welcomeBody
      }, { type: 'welcome', screen: 'Home' });

      // 2. Send Welcome Email (if email exists)
      if (user.email) {
        await sendWelcomeEmail(user.email, user.name, 'Customer');
      }
    }

    res.json({
      success: true,
      message: isNewUser ? 'Registration successful' : 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        addresses: user.addresses,
        walletBalance: user.walletBalance,
        referralCode: user.referralCode
      },
      token: generateToken(user._id),
      isNewUser
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Server error verifying OTP' });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    // Same test number logic
    const testNumbers = ['8770620342', '9199818320', '9009925021', '6261096283', '9752275626', '7047716600', '9685974247'];
    const isTestNumber = testNumbers.includes(phone);

    const otp = isTestNumber ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.findOne({ phone });
    if (user) {
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      await Otp.findOneAndUpdate(
        { phone },
        { phone, otp, expiresAt: otpExpires },
        { upsert: true }
      );
    }

    if (!isTestNumber) {
      await smsService.sendOTP(phone, otp);
    }

    res.json({ success: true, message: 'OTP resent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resending OTP' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('name email phone role profileImage addresses walletBalance referralCode');
    const totalOrders = await Order.countDocuments({ user: req.user._id });

    if (user) {
      await ensureUserReferralCode(user);
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profileImage: user.profileImage,
          addresses: user.addresses,
          walletBalance: user.walletBalance,
          referralCode: user.referralCode,
          totalOrders: totalOrders
        }
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (req.body.name) {
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!nameRegex.test(req.body.name.trim())) {
          return res.status(400).json({ message: 'Full name should only contain letters and spaces, without numbers or special characters' });
        }
      }
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      // Handle profile image if uploaded via multer (req.file)
      if (req.file) {
        // Delete old image from cloudinary if exists
        if (user.profileImagePublicId) {
          await cloudinary.uploader.destroy(user.profileImagePublicId);
        }
        user.profileImage = req.file.path;
        user.profileImagePublicId = req.file.filename;
      }

      await ensureUserReferralCode(user);
      const updatedUser = await user.save();
      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          profileImage: updatedUser.profileImage,
          addresses: updatedUser.addresses,
          walletBalance: updatedUser.walletBalance,
          referralCode: updatedUser.referralCode
        }
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// @desc    Delete user profile (account deletion)
// @route   DELETE /api/auth/profile
// @access  Private
export const deleteProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete profile image from cloudinary if exists
    if (user.profileImagePublicId) {
      try {
        await cloudinary.uploader.destroy(user.profileImagePublicId);
      } catch (err) {
        console.error('Error deleting image from Cloudinary:', err);
      }
    }

    await User.findByIdAndDelete(req.user._id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete Profile Error:', error);
    res.status(500).json({ message: 'Server error deleting account' });
  }
};

