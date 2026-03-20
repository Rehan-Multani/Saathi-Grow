import User from '../models/User.js';
import UserTransaction from '../models/UserTransaction.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { sendPushNotification } from '../services/notificationService.js';

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

// @desc    Get current wallet balance and recent transactions
// @route   GET /api/wallet/balance
// @access  Private
export const getWalletData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const transactions = await UserTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      balance: user.walletBalance,
      transactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Initiate wallet topup (Razorpay Order)
// @route   POST /api/wallet/topup/initiate
// @access  Private
export const initiateTopup = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const options = {
      amount: parseInt(amount * 100), // in paise
      currency: 'INR',
      receipt: `wallet_topup_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({
      success: true,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify wallet topup and update balance
// @route   POST /api/wallet/topup/verify
// @access  Private
export const verifyTopup = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      amount
    } = req.body;

    const sign = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpaySignature !== expectedSign) {
      return res.status(400).json({ message: "Invalid payment signature!" });
    }

    // Update User Balance
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { walletBalance: amount } },
      { new: true }
    );

    // Create Transaction Log
    await UserTransaction.create({
      user: req.user._id,
      amount,
      type: 'credit',
      category: 'topup',
      status: 'completed',
      description: 'Wallet Topup via Razorpay',
      razorpayOrderId,
      razorpayPaymentId
    });

    res.status(200).json({
      success: true,
      balance: user.walletBalance,
      message: 'Wallet topped up successfully'
    });

    // Notify User (Push)
    await sendPushNotification(req.user._id, 'User', {
      title: 'Wallet Topped Up!',
      body: `₹${amount} has been successfully added to your wallet. New balance: ₹${user.walletBalance}`
    }, { type: 'wallet_topup', balance: user.walletBalance.toString() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
