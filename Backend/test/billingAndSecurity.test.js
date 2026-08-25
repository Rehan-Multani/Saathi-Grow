import assert from 'node:assert/strict';
import test from 'node:test';
import { parseRupeesToPaise, validateRazorpayEntities, PaymentVerificationError } from '../src/services/razorpayVerificationService.js';

// Unit simulation of computeBillDetails logic
const simulateBillCalculation = ({
  items = [{ price: 100, quantity: 1 }],
  settings = {
    defaultTaxRate: 5,
    baseDeliveryFee: 30,
    surgeMultiplier: 1,
    freeDeliveryThreshold: 500,
    handlingFee: 5,
    immediateDeliveryEnabled: true,
    immediateDeliveryFee: 20
  },
  promo = null,
  orderSource = 'online',
  isImmediate = false
} = {}) => {
  const subTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = (subTotal * settings.defaultTaxRate) / 100;

  let baseDeliveryFee = settings.baseDeliveryFee * settings.surgeMultiplier;
  if (subTotal >= settings.freeDeliveryThreshold) {
    baseDeliveryFee = 0;
  }

  let immediateDeliveryFee = 0;
  if (isImmediate === true && settings.immediateDeliveryEnabled === true && orderSource !== 'pos') {
    immediateDeliveryFee = Number(settings.immediateDeliveryFee) || 0;
  }

  let deliveryFee = baseDeliveryFee + immediateDeliveryFee;
  let handlingFee = settings.handlingFee;

  if (orderSource === 'pos') {
    baseDeliveryFee = 0;
    immediateDeliveryFee = 0;
    deliveryFee = 0;
    handlingFee = 0;
  }

  let totalAmount = subTotal + taxAmount + deliveryFee + handlingFee;
  let discountAmount = 0;

  if (promo && promo.isActive) {
    if (promo.discountType === 'FreeShipping') {
      discountAmount = baseDeliveryFee; // Waives only base delivery fee
    } else if (promo.discountType === 'Fixed') {
      discountAmount = promo.discountValue;
    }
    discountAmount = Math.min(discountAmount, totalAmount);
    totalAmount -= discountAmount;
  }

  return {
    subTotal,
    taxAmount,
    baseDeliveryFee,
    immediateDeliveryFee,
    deliveryFee,
    handlingFee,
    discountAmount,
    totalAmount
  };
};

test('13. Scheduled delivery: isImmediate = false -> immediateDeliveryFee = 0', () => {
  const bill = simulateBillCalculation({
    items: [{ price: 200, quantity: 1 }],
    isImmediate: false
  });
  assert.equal(bill.baseDeliveryFee, 30);
  assert.equal(bill.immediateDeliveryFee, 0);
  assert.equal(bill.deliveryFee, 30);
  assert.equal(bill.totalAmount, 200 + 10 + 30 + 5); // 245
});

test('14. Immediate delivery: isImmediate = true & enabled -> immediateDeliveryFee applied', () => {
  const bill = simulateBillCalculation({
    items: [{ price: 200, quantity: 1 }],
    isImmediate: true
  });
  assert.equal(bill.baseDeliveryFee, 30);
  assert.equal(bill.immediateDeliveryFee, 20);
  assert.equal(bill.deliveryFee, 50); // 30 + 20
  assert.equal(bill.totalAmount, 200 + 10 + 50 + 5); // 265
});

test('15. Immediate delivery disabled: immediateDeliveryEnabled = false -> immediateDeliveryFee = 0', () => {
  const bill = simulateBillCalculation({
    items: [{ price: 200, quantity: 1 }],
    settings: {
      defaultTaxRate: 5,
      baseDeliveryFee: 30,
      surgeMultiplier: 1,
      freeDeliveryThreshold: 500,
      handlingFee: 5,
      immediateDeliveryEnabled: false,
      immediateDeliveryFee: 20
    },
    isImmediate: true
  });
  assert.equal(bill.baseDeliveryFee, 30);
  assert.equal(bill.immediateDeliveryFee, 0);
  assert.equal(bill.deliveryFee, 30);
});

test('16. Free delivery threshold + immediate: baseDeliveryFee = 0, immediateDeliveryFee remains', () => {
  const bill = simulateBillCalculation({
    items: [{ price: 600, quantity: 1 }], // >= 500 threshold
    isImmediate: true
  });
  assert.equal(bill.baseDeliveryFee, 0);
  assert.equal(bill.immediateDeliveryFee, 20);
  assert.equal(bill.deliveryFee, 20);
  assert.equal(bill.totalAmount, 600 + 30 + 20 + 5); // 655
});

test('17. FreeShipping promo + immediate: base waived, immediate remains payable', () => {
  const bill = simulateBillCalculation({
    items: [{ price: 300, quantity: 1 }],
    promo: { isActive: true, discountType: 'FreeShipping' },
    isImmediate: true
  });
  assert.equal(bill.baseDeliveryFee, 30);
  assert.equal(bill.immediateDeliveryFee, 20);
  assert.equal(bill.deliveryFee, 50);
  assert.equal(bill.discountAmount, 30); // Waives only base delivery fee
  assert.equal(bill.totalAmount, 300 + 15 + 50 + 5 - 30); // 340 (includes 20 immediate fee)
});

test('18. POS order: all delivery and handling fees are 0', () => {
  const bill = simulateBillCalculation({
    items: [{ price: 200, quantity: 1 }],
    orderSource: 'pos',
    isImmediate: true
  });
  assert.equal(bill.baseDeliveryFee, 0);
  assert.equal(bill.immediateDeliveryFee, 0);
  assert.equal(bill.deliveryFee, 0);
  assert.equal(bill.handlingFee, 0);
  assert.equal(bill.totalAmount, 200 + 10); // subTotal + tax
});

test('19. Normal scheduled delivery below threshold: base delivery unchanged', () => {
  const bill = simulateBillCalculation({
    items: [{ price: 100, quantity: 1 }],
    isImmediate: false
  });
  assert.equal(bill.baseDeliveryFee, 30);
  assert.equal(bill.immediateDeliveryFee, 0);
  assert.equal(bill.deliveryFee, 30);
});

test('20. Razorpay amount in paise strictly includes authoritative immediate surcharge', () => {
  const bill = simulateBillCalculation({
    items: [{ price: 200, quantity: 1 }],
    isImmediate: true
  });
  const paise = parseRupeesToPaise(bill.totalAmount);
  assert.equal(paise, 26500); // 265 * 100
});

test('21. Tampered/underpaid amount (client attempting to omit immediate surcharge) throws PAYMENT_AMOUNT_MISMATCH', () => {
  const bill = simulateBillCalculation({
    items: [{ price: 200, quantity: 1 }],
    isImmediate: true
  });
  const expectedAmountPaise = parseRupeesToPaise(bill.totalAmount); // 26500

  const tamperedEntities = {
    payment: {
      id: 'pay_test_123',
      order_id: 'order_test_123',
      amount: 24500, // 245 without 20 immediate surcharge
      currency: 'INR',
      status: 'captured',
      captured: true
    },
    order: {
      id: 'order_test_123',
      amount: 24500,
      amount_due: 0,
      currency: 'INR',
      status: 'paid'
    }
  };

  assert.throws(() => validateRazorpayEntities({
    ...tamperedEntities,
    razorpayOrderId: 'order_test_123',
    razorpayPaymentId: 'pay_test_123',
    expectedAmountPaise
  }), (error) => error.code === 'PAYMENT_AMOUNT_MISMATCH');
});

test('22, 23, 24. Order document receives authoritative immediateDeliveryFee', () => {
  const bill = simulateBillCalculation({
    items: [{ price: 200, quantity: 1 }],
    isImmediate: true
  });

  const buildOrderData = (paymentMethod) => ({
    user: 'user_123',
    paymentMethod,
    totalAmount: bill.totalAmount,
    subTotal: bill.subTotal,
    taxAmount: bill.taxAmount,
    deliveryFee: bill.deliveryFee,
    immediateDeliveryFee: bill.immediateDeliveryFee,
    handlingFee: bill.handlingFee
  });

  const onlineOrder = buildOrderData('online');
  const codOrder = buildOrderData('cod');
  const walletOrder = buildOrderData('wallet');

  assert.equal(onlineOrder.immediateDeliveryFee, 20);
  assert.equal(codOrder.immediateDeliveryFee, 20);
  assert.equal(walletOrder.immediateDeliveryFee, 20);
  assert.equal(onlineOrder.totalAmount, 265);
  assert.equal(codOrder.totalAmount, 265);
  assert.equal(walletOrder.totalAmount, 265);
});
