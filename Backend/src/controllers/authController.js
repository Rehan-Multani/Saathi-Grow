import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Request OTP for Login/Register
// @route   POST /api/auth/request-otp
// @access  Public
export const requestOTP = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  // Find or Create user (Upsert during OTP request is common in Q-commerce)
  let user = await User.findOne({ phone });

  if (!user) {
    user = new User({ phone });
  }

  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  // MOCK: Sending OTP via SMS
  console.log(`[SMS MOCK] OTP for ${phone} is: ${otp}`);

  res.status(200).json({
    success: true,
    message: 'OTP sent successfully',
    // In development/test mode, we can return OTP for easy testing
    otp: process.env.NODE_ENV === 'development' ? otp : undefined
  });
};

// @desc    Verify OTP and Login/Register
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ message: 'Phone and OTP are required' });
  }

  const user = await User.findOne({
    phone,
    otp,
    otpExpires: { $gt: Date.now() }
  }).select('+otp +otpExpires');

  if (!user) {
    return res.status(401).json({ message: 'Invalid or expired OTP' });
  }

  // Clear OTP after successful verification
  user.otp = undefined;
  user.otpExpires = undefined;

  // If it's a new user, user might want to fill name/email later
  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    token: generateToken(user._id),
    isNewUser: user.createdAt === user.updatedAt // Simple flag for frontend
  });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      addresses: user.addresses,
      walletBalance: user.walletBalance
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update profile (after OTP login)
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
