import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test from 'node:test';
import {
  PaymentVerificationError,
  parseRupeesToPaise,
  validateRazorpayEntities,
  verifyCheckoutSignature,
  verifyWebhookSignature
} from '../src/services/razorpayVerificationService.js';

const capturedEntities = ({ amount = 50000, currency = 'INR' } = {}) => ({
  payment: {
    id: 'pay_secure_test',
    order_id: 'order_secure_test',
    amount,
    currency,
    status: 'captured',
    captured: true
  },
  order: {
    id: 'order_secure_test',
    amount,
    amount_due: 0,
    currency,
    status: 'paid'
  }
});

test('parseRupeesToPaise accepts valid currency precision', () => {
  assert.equal(parseRupeesToPaise(500), 50000);
  assert.equal(parseRupeesToPaise('10.25'), 1025);
  assert.equal(parseRupeesToPaise(0.01), 1);
});

test('parseRupeesToPaise rejects invalid and over-precise values', () => {
  for (const value of [0, -1, 'not-a-number', Infinity, 10.001]) {
    assert.throws(() => parseRupeesToPaise(value), PaymentVerificationError);
  }
});

test('checkout signature validation accepts only the signed order/payment pair', () => {
  const previousSecret = process.env.RAZORPAY_KEY_SECRET;
  process.env.RAZORPAY_KEY_SECRET = 'test_secret';
  try {
    const razorpayOrderId = 'order_secure_test';
    const razorpayPaymentId = 'pay_secure_test';
    const razorpaySignature = crypto
      .createHmac('sha256', 'test_secret')
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    assert.doesNotThrow(() => verifyCheckoutSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    }));
    assert.throws(() => verifyCheckoutSignature({
      razorpayOrderId,
      razorpayPaymentId: 'pay_tampered',
      razorpaySignature
    }), PaymentVerificationError);
  } finally {
    if (previousSecret == null) delete process.env.RAZORPAY_KEY_SECRET;
    else process.env.RAZORPAY_KEY_SECRET = previousSecret;
  }
});

test('provider validation uses captured amount instead of a client amount', () => {
  const entities = capturedEntities({ amount: 1000 });
  const result = validateRazorpayEntities({
    ...entities,
    razorpayOrderId: 'order_secure_test',
    razorpayPaymentId: 'pay_secure_test',
    expectedAmountPaise: 1000
  });
  assert.equal(result.amountPaise, 1000);

  assert.throws(() => validateRazorpayEntities({
    ...entities,
    razorpayOrderId: 'order_secure_test',
    razorpayPaymentId: 'pay_secure_test',
    expectedAmountPaise: 5000000
  }), (error) => error.code === 'PAYMENT_AMOUNT_MISMATCH');
});

test('provider validation rejects uncaptured, mismatched, and wrong-currency payments', () => {
  const uncaptured = capturedEntities();
  uncaptured.payment.status = 'authorized';
  uncaptured.payment.captured = false;
  assert.throws(() => validateRazorpayEntities({
    ...uncaptured,
    razorpayOrderId: 'order_secure_test',
    razorpayPaymentId: 'pay_secure_test',
    expectedAmountPaise: 50000
  }), (error) => error.code === 'PAYMENT_NOT_CAPTURED');

  const wrongOrder = capturedEntities();
  wrongOrder.payment.order_id = 'order_other';
  assert.throws(() => validateRazorpayEntities({
    ...wrongOrder,
    razorpayOrderId: 'order_secure_test',
    razorpayPaymentId: 'pay_secure_test',
    expectedAmountPaise: 50000
  }), PaymentVerificationError);

  const wrongCurrency = capturedEntities({ currency: 'USD' });
  assert.throws(() => validateRazorpayEntities({
    ...wrongCurrency,
    razorpayOrderId: 'order_secure_test',
    razorpayPaymentId: 'pay_secure_test',
    expectedAmountPaise: 50000
  }), (error) => error.code === 'PAYMENT_CURRENCY_MISMATCH');
});

test('webhook signature validation uses the untouched request body', () => {
  const previousSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  process.env.RAZORPAY_WEBHOOK_SECRET = 'webhook_test_secret';
  try {
    const body = Buffer.from('{"event":"payment.captured"}');
    const signature = crypto
      .createHmac('sha256', 'webhook_test_secret')
      .update(body)
      .digest('hex');
    assert.doesNotThrow(() => verifyWebhookSignature(body, signature));
    assert.throws(() => verifyWebhookSignature(body, 'invalid'), PaymentVerificationError);
  } finally {
    if (previousSecret == null) delete process.env.RAZORPAY_WEBHOOK_SECRET;
    else process.env.RAZORPAY_WEBHOOK_SECRET = previousSecret;
  }
});
