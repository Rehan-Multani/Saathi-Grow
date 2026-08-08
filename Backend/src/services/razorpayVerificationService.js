import crypto from 'crypto';
import Razorpay from 'razorpay';

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

export class PaymentVerificationError extends Error {
  constructor(message, statusCode = 400, code = 'PAYMENT_VERIFICATION_FAILED') {
    super(message);
    this.name = 'PaymentVerificationError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

const secureStringEqual = (provided, expected) => {
  const providedBuffer = Buffer.from(String(provided || ''), 'utf8');
  const expectedBuffer = Buffer.from(String(expected || ''), 'utf8');
  return providedBuffer.length === expectedBuffer.length
    && crypto.timingSafeEqual(providedBuffer, expectedBuffer);
};

export const parseRupeesToPaise = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new PaymentVerificationError('Invalid top-up amount');
  }

  const rawPaise = amount * 100;
  const amountPaise = Math.round(rawPaise);
  if (!Number.isSafeInteger(amountPaise) || Math.abs(rawPaise - amountPaise) > 1e-7) {
    throw new PaymentVerificationError('Amount can have at most two decimal places');
  }

  return amountPaise;
};

export const verifyCheckoutSignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new PaymentVerificationError('Incomplete payment verification details');
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (!secureStringEqual(razorpaySignature, expectedSignature)) {
    throw new PaymentVerificationError('Invalid payment signature');
  }
};

export const verifyWebhookSignature = (rawBody, providedSignature) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new PaymentVerificationError('Wallet webhook is not configured', 503, 'WEBHOOK_NOT_CONFIGURED');
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (!secureStringEqual(providedSignature, expectedSignature)) {
    throw new PaymentVerificationError('Invalid webhook signature', 401, 'INVALID_WEBHOOK_SIGNATURE');
  }
};

export const validateRazorpayEntities = ({
  payment,
  order,
  razorpayOrderId,
  razorpayPaymentId,
  expectedAmountPaise,
  expectedCurrency = 'INR'
}) => {
  if (!payment || !order) {
    throw new PaymentVerificationError('Payment details are unavailable', 502, 'PAYMENT_PROVIDER_UNAVAILABLE');
  }

  if (String(payment.id) !== String(razorpayPaymentId)) {
    throw new PaymentVerificationError('Payment ID does not match the verified payment');
  }
  if (String(order.id) !== String(razorpayOrderId) || String(payment.order_id) !== String(razorpayOrderId)) {
    throw new PaymentVerificationError('Payment does not belong to this Razorpay order');
  }
  if (payment.status !== 'captured' || payment.captured !== true) {
    throw new PaymentVerificationError('Payment has not been captured', 409, 'PAYMENT_NOT_CAPTURED');
  }
  if (order.status !== 'paid' || Number(order.amount_due) !== 0) {
    throw new PaymentVerificationError('Razorpay order is not fully paid', 409, 'ORDER_NOT_PAID');
  }

  const paymentAmountPaise = Number(payment.amount);
  const orderAmountPaise = Number(order.amount);
  if (!Number.isSafeInteger(paymentAmountPaise) || !Number.isSafeInteger(orderAmountPaise)) {
    throw new PaymentVerificationError('Payment provider returned an invalid amount', 502, 'INVALID_PROVIDER_AMOUNT');
  }
  if (
    paymentAmountPaise !== orderAmountPaise
    || (expectedAmountPaise != null && paymentAmountPaise !== expectedAmountPaise)
  ) {
    throw new PaymentVerificationError('Paid amount does not match the expected amount', 409, 'PAYMENT_AMOUNT_MISMATCH');
  }
  if (payment.currency !== expectedCurrency || order.currency !== expectedCurrency) {
    throw new PaymentVerificationError('Payment currency does not match the expected currency', 409, 'PAYMENT_CURRENCY_MISMATCH');
  }

  return {
    amountPaise: paymentAmountPaise,
    currency: payment.currency,
    payment,
    order
  };
};

export const fetchAndValidateRazorpayPayment = async ({
  razorpayOrderId,
  razorpayPaymentId,
  expectedAmountPaise,
  expectedCurrency = 'INR'
}) => {
  let payment;
  let order;
  try {
    [payment, order] = await Promise.all([
      razorpayInstance.payments.fetch(razorpayPaymentId),
      razorpayInstance.orders.fetch(razorpayOrderId)
    ]);
  } catch (error) {
    console.error('[PAYMENT_PROVIDER_LOOKUP_FAILED]', {
      orderIdSuffix: String(razorpayOrderId || '').slice(-6),
      paymentIdSuffix: String(razorpayPaymentId || '').slice(-6),
      message: error.message
    });
    throw new PaymentVerificationError(
      'Unable to confirm payment with Razorpay',
      502,
      'PAYMENT_PROVIDER_UNAVAILABLE'
    );
  }

  return validateRazorpayEntities({
    payment,
    order,
    razorpayOrderId,
    razorpayPaymentId,
    expectedAmountPaise,
    expectedCurrency
  });
};

export default razorpayInstance;
