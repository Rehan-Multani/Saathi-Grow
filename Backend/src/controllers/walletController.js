import User from '../models/User.js';
import UserTransaction from '../models/UserTransaction.js';
import WalletTopup from '../models/WalletTopup.js';
import {
  createWalletTopupIntent,
  verifyAndCreditWalletTopup
} from '../services/walletTopupService.js';
import {
  PaymentVerificationError,
  verifyWebhookSignature
} from '../services/razorpayVerificationService.js';

const sendPaymentError = (res, error, fallbackMessage) => {
  const statusCode = error instanceof PaymentVerificationError
    ? error.statusCode
    : (error.statusCode || 500);
  if (statusCode >= 500) {
    console.error('[WALLET_PAYMENT_ERROR]', error);
  }
  return res.status(statusCode).json({
    success: false,
    message: error instanceof PaymentVerificationError ? error.message : fallbackMessage,
    code: error.code || 'WALLET_PAYMENT_ERROR'
  });
};

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
    const { razorpayOrder: order } = await createWalletTopupIntent({
      userId: req.user._id,
      amount
    });

    res.status(200).json({
      success: true,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    sendPaymentError(res, error, 'Unable to initiate wallet top-up');
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
      razorpaySignature
    } = req.body;

    const result = await verifyAndCreditWalletTopup({
      userId: req.user._id,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    res.status(200).json({
      success: true,
      balance: result.balance,
      amount: result.amount,
      replayed: result.replayed,
      message: result.replayed ? 'Wallet top-up was already processed' : 'Wallet topped up successfully'
    });
  } catch (error) {
    sendPaymentError(res, error, 'Unable to verify wallet top-up');
  }
};

// Razorpay requires the untouched request body for webhook signature verification.
export const handleWalletTopupWebhook = async (req, res) => {
  try {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '');
    verifyWebhookSignature(rawBody, req.header('x-razorpay-signature'));

    let event;
    try {
      event = JSON.parse(rawBody.toString('utf8'));
    } catch {
      throw new PaymentVerificationError('Invalid webhook payload');
    }

    if (event.event !== 'payment.captured') {
      return res.status(200).json({ success: true, ignored: true });
    }

    const payment = event.payload?.payment?.entity;
    const razorpayOrderId = payment?.order_id;
    const razorpayPaymentId = payment?.id;
    if (!razorpayOrderId || !razorpayPaymentId) {
      throw new PaymentVerificationError('Webhook payment details are incomplete');
    }

    const intent = await WalletTopup.findOne({ razorpayOrderId }).select('user');
    if (!intent) {
      console.warn('[WALLET_WEBHOOK_INTENT_NOT_FOUND]', {
        orderIdSuffix: String(razorpayOrderId).slice(-6)
      });
      return res.status(200).json({ success: true, ignored: true });
    }

    const result = await verifyAndCreditWalletTopup({
      userId: intent.user,
      razorpayOrderId,
      razorpayPaymentId,
      verifySignature: false
    });

    return res.status(200).json({
      success: true,
      replayed: result.replayed
    });
  } catch (error) {
    return sendPaymentError(res, error, 'Unable to process wallet webhook');
  }
};
