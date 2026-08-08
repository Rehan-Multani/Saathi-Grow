import mongoose from 'mongoose';
import User from '../models/User.js';
import UserTransaction from '../models/UserTransaction.js';
import WalletTopup from '../models/WalletTopup.js';
import { sendPushNotification } from './notificationService.js';
import razorpayInstance, {
  PaymentVerificationError,
  fetchAndValidateRazorpayPayment,
  parseRupeesToPaise,
  verifyCheckoutSignature
} from './razorpayVerificationService.js';

const TOPUP_INTENT_TTL_MS = 24 * 60 * 60 * 1000;

const getConfiguredLimitPaise = (name, fallbackRupees) => {
  const configured = process.env[name];
  return parseRupeesToPaise(configured == null || configured === '' ? fallbackRupees : configured);
};

export const getTopupLimits = () => ({
  minAmountPaise: getConfiguredLimitPaise('WALLET_TOPUP_MIN_AMOUNT', 1),
  maxAmountPaise: getConfiguredLimitPaise('WALLET_TOPUP_MAX_AMOUNT', 100000)
});

export const createWalletTopupIntent = async ({ userId, amount }) => {
  const amountPaise = parseRupeesToPaise(amount);
  const { minAmountPaise, maxAmountPaise } = getTopupLimits();
  if (amountPaise < minAmountPaise || amountPaise > maxAmountPaise) {
    throw new PaymentVerificationError(
      `Top-up amount must be between Rs ${minAmountPaise / 100} and Rs ${maxAmountPaise / 100}`
    );
  }

  const user = await User.findOne({ _id: userId, isActive: { $ne: false } }).select('_id');
  if (!user) {
    throw new PaymentVerificationError('Wallet top-up is unavailable for this account', 403, 'ACCOUNT_INACTIVE');
  }

  const intent = await WalletTopup.create({
    user: userId,
    expectedAmountPaise: amountPaise,
    currency: 'INR',
    status: 'creating',
    expiresAt: new Date(Date.now() + TOPUP_INTENT_TTL_MS)
  });

  try {
    const order = await razorpayInstance.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `wallet_${intent._id}`,
      notes: {
        purpose: 'wallet_topup',
        userId: String(userId),
        topupIntentId: String(intent._id)
      }
    });

    intent.razorpayOrderId = order.id;
    intent.status = 'created';
    await intent.save();

    return {
      intent,
      razorpayOrder: order
    };
  } catch (error) {
    intent.status = 'failed';
    intent.failureReason = String(error.message || 'Razorpay order creation failed').slice(0, 300);
    await intent.save().catch(() => {});
    throw new PaymentVerificationError(
      'Unable to initiate wallet top-up',
      502,
      'TOPUP_INITIATION_FAILED'
    );
  }
};

const assertIntentOwnership = (intent, userId) => {
  if (userId && String(intent.user) !== String(userId)) {
    throw new PaymentVerificationError('Top-up does not belong to this customer', 403, 'TOPUP_OWNERSHIP_MISMATCH');
  }
};

const assertProviderOwnership = (providerOrder, userId) => {
  const providerUserId = providerOrder?.notes?.userId;
  if (providerUserId && userId && String(providerUserId) !== String(userId)) {
    throw new PaymentVerificationError('Payment was initiated by a different customer', 403, 'PAYMENT_OWNERSHIP_MISMATCH');
  }
};

const findOrCreateLegacyIntent = async ({ userId, razorpayOrderId, verification }) => {
  const receipt = String(verification.order?.receipt || '');
  if (!receipt.startsWith('wallet_topup_')) {
    throw new PaymentVerificationError('Wallet top-up intent was not found', 404, 'TOPUP_INTENT_NOT_FOUND');
  }

  assertProviderOwnership(verification.order, userId);

  try {
    return await WalletTopup.create({
      user: userId,
      razorpayOrderId,
      expectedAmountPaise: verification.amountPaise,
      currency: verification.currency,
      status: 'created',
      legacy: true,
      expiresAt: new Date(Date.now() + TOPUP_INTENT_TTL_MS)
    });
  } catch (error) {
    if (error?.code !== 11000) throw error;
    const existing = await WalletTopup.findOne({ razorpayOrderId });
    if (!existing) throw error;
    assertIntentOwnership(existing, userId);
    return existing;
  }
};

const getCreditedResult = async (intent) => {
  const user = await User.findById(intent.user).select('walletBalance').lean();
  if (!user) {
    throw new PaymentVerificationError('Customer account not found', 404, 'USER_NOT_FOUND');
  }
  return {
    success: true,
    balance: user.walletBalance,
    amount: intent.creditedAmountPaise / 100,
    replayed: true,
    newlyCredited: false
  };
};

export const finalizeWalletTopup = async ({ intent, verification, userId = null }) => {
  assertIntentOwnership(intent, userId);
  assertProviderOwnership(verification.order, userId || intent.user);

  if (intent.status === 'credited') {
    if (String(intent.razorpayPaymentId) !== String(verification.payment.id)) {
      throw new PaymentVerificationError('Top-up was already completed with a different payment', 409, 'TOPUP_ALREADY_CREDITED');
    }
    return getCreditedResult(intent);
  }

  const session = await mongoose.startSession();
  let result;
  try {
    try {
      await session.withTransaction(async () => {
        const currentIntent = await WalletTopup.findById(intent._id).session(session);
        if (!currentIntent) {
          throw new PaymentVerificationError('Wallet top-up intent not found', 404, 'TOPUP_INTENT_NOT_FOUND');
        }
        assertIntentOwnership(currentIntent, userId);

        if (currentIntent.status === 'credited') {
          if (String(currentIntent.razorpayPaymentId) !== String(verification.payment.id)) {
            throw new PaymentVerificationError('Top-up was already completed with a different payment', 409, 'TOPUP_ALREADY_CREDITED');
          }
          const existingUser = await User.findById(currentIntent.user).select('walletBalance').session(session).lean();
          result = {
            success: true,
            balance: existingUser?.walletBalance,
            amount: currentIntent.creditedAmountPaise / 100,
            replayed: true,
            newlyCredited: false
          };
          return;
        }

        const existingTransaction = await UserTransaction.findOne({
          category: 'topup',
          razorpayPaymentId: verification.payment.id
        }).session(session);

        if (existingTransaction) {
          if (
            String(existingTransaction.user) !== String(currentIntent.user)
            || Number(existingTransaction.amount) !== verification.amountPaise / 100
          ) {
            throw new PaymentVerificationError('Payment has already been used', 409, 'PAYMENT_ALREADY_USED');
          }

          currentIntent.razorpayPaymentId = verification.payment.id;
          currentIntent.creditedAmountPaise = verification.amountPaise;
          currentIntent.providerPaymentStatus = verification.payment.status;
          currentIntent.status = 'credited';
          currentIntent.verifiedAt = new Date();
          currentIntent.creditedAt = existingTransaction.createdAt || new Date();
          currentIntent.failureReason = null;
          await currentIntent.save({ session });

          const existingUser = await User.findById(currentIntent.user).select('walletBalance').session(session).lean();
          result = {
            success: true,
            balance: existingUser?.walletBalance,
            amount: verification.amountPaise / 100,
            replayed: true,
            newlyCredited: false
          };
          return;
        }

        const user = await User.findOneAndUpdate(
          { _id: currentIntent.user, isActive: { $ne: false } },
          { $inc: { walletBalance: verification.amountPaise / 100 } },
          { new: true, session }
        );
        if (!user) {
          throw new PaymentVerificationError('Wallet top-up is unavailable for this account', 403, 'ACCOUNT_INACTIVE');
        }

        await UserTransaction.create([{
          user: currentIntent.user,
          amount: verification.amountPaise / 100,
          type: 'credit',
          category: 'topup',
          status: 'completed',
          description: 'Wallet Topup via Razorpay',
          razorpayOrderId: currentIntent.razorpayOrderId,
          razorpayPaymentId: verification.payment.id
        }], { session });

        currentIntent.razorpayPaymentId = verification.payment.id;
        currentIntent.creditedAmountPaise = verification.amountPaise;
        currentIntent.providerPaymentStatus = verification.payment.status;
        currentIntent.status = 'credited';
        currentIntent.verifiedAt = new Date();
        currentIntent.creditedAt = new Date();
        currentIntent.failureReason = null;
        await currentIntent.save({ session });

        result = {
          success: true,
          balance: user.walletBalance,
          amount: verification.amountPaise / 100,
          replayed: false,
          newlyCredited: true
        };
      });
    } catch (error) {
      // A simultaneous callback can lose the unique-index race after the other one commits.
      if (error?.code !== 11000) throw error;

      const completedIntent = await WalletTopup.findById(intent._id);
      if (
        completedIntent?.status !== 'credited'
        || String(completedIntent.razorpayPaymentId) !== String(verification.payment.id)
      ) {
        throw new PaymentVerificationError('Payment has already been used', 409, 'PAYMENT_ALREADY_USED');
      }
      result = await getCreditedResult(completedIntent);
    }
  } finally {
    await session.endSession();
  }

  if (result?.newlyCredited) {
    sendPushNotification(intent.user, 'User', {
      title: 'Wallet Topped Up!',
      body: `Rs ${result.amount} has been added to your wallet. New balance: Rs ${result.balance}`
    }, {
      type: 'wallet_topup',
      balance: String(result.balance)
    }).catch((error) => console.error('[TOPUP_NOTIFICATION_FAILED]', error.message));
  }

  return result;
};

export const verifyAndCreditWalletTopup = async ({
  userId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature = null,
  verifySignature = true
}) => {
  if (verifySignature) {
    verifyCheckoutSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
  }

  let intent = await WalletTopup.findOne({ razorpayOrderId });
  if (intent) {
    assertIntentOwnership(intent, userId);
    if (intent.status === 'credited') {
      if (String(intent.razorpayPaymentId) !== String(razorpayPaymentId)) {
        throw new PaymentVerificationError('Top-up was already completed with a different payment', 409, 'TOPUP_ALREADY_CREDITED');
      }
      return getCreditedResult(intent);
    }
  }

  const verification = await fetchAndValidateRazorpayPayment({
    razorpayOrderId,
    razorpayPaymentId,
    expectedAmountPaise: intent?.expectedAmountPaise ?? null,
    expectedCurrency: intent?.currency || 'INR'
  });

  if (!intent) {
    intent = await findOrCreateLegacyIntent({ userId, razorpayOrderId, verification });
  }

  if (intent.expectedAmountPaise !== verification.amountPaise) {
    throw new PaymentVerificationError('Paid amount does not match the top-up intent', 409, 'PAYMENT_AMOUNT_MISMATCH');
  }

  return finalizeWalletTopup({ intent, verification, userId });
};
