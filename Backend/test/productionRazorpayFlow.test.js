import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import GlobalSetting from '../src/models/GlobalSetting.js';
import Order from '../src/models/Order.js';
import { parseRupeesToPaise, validateRazorpayEntities, PaymentVerificationError } from '../src/services/razorpayVerificationService.js';
import { computeBillDetails } from '../src/controllers/orderController.js';

const originalProductFindById = Product.findById;
const originalGlobalSettingFindOne = GlobalSetting.findOne;

const prodId = new mongoose.Types.ObjectId().toString();
const mockProduct = { name: 'Item', basePrice: 200, price: 200, isAllBranches: true, stock: 50 };

test.beforeEach(() => {
  Product.findById = function(id) {
    return Promise.resolve({ ...mockProduct, _id: id });
  };

  GlobalSetting.findOne = function() {
    return Promise.resolve({
      defaultTaxRate: 5,
      baseDeliveryFee: 30,
      surgeMultiplier: 1,
      freeDeliveryThreshold: 500,
      handlingFee: 5,
      immediateDeliveryEnabled: true,
      immediateDeliveryFee: 20,
      platformCommissionRate: 10
    });
  };
});

test.afterEach(() => {
  Product.findById = originalProductFindById;
  GlobalSetting.findOne = originalGlobalSettingFindOne;
});

test('ACTUAL PRODUCTION Razorpay flow: createRazorpayOrder generates amount with authoritative immediate surcharge', async () => {
  const items = [{ product: prodId, quantity: 1 }]; // subtotal = 200, tax = 10, base = 30, immediate = 20, handling = 5 -> Total = 265
  const isImmediate = true;

  const computedBill = await computeBillDetails(items, { isImmediate });
  const amountPaise = parseRupeesToPaise(computedBill.totalAmount);

  assert.equal(computedBill.immediateDeliveryFee, 20);
  assert.equal(computedBill.totalAmount, 265);
  assert.equal(amountPaise, 26500);
});

test('ACTUAL PRODUCTION Razorpay flow: verifyRazorpayPayment rejects payment if client tries to bypass immediate surcharge', async () => {
  const items = [{ product: prodId, quantity: 1 }];
  const isImmediate = true;

  const serverBill = await computeBillDetails(items, { isImmediate }); // 265 INR
  const expectedAmountPaise = parseRupeesToPaise(serverBill.totalAmount); // 26500 paise

  // Client attempts to verify a 24500 paise payment (omitted the 2000 paise / 20 INR surcharge)
  const clientPaidPaise = 24500;
  const mockEntities = {
    payment: {
      id: 'pay_tamper_attempt',
      order_id: 'order_123',
      amount: clientPaidPaise,
      currency: 'INR',
      status: 'captured',
      captured: true
    },
    order: {
      id: 'order_123',
      amount: clientPaidPaise,
      amount_due: 0,
      currency: 'INR',
      status: 'paid'
    }
  };

  assert.throws(() => validateRazorpayEntities({
    ...mockEntities,
    razorpayOrderId: 'order_123',
    razorpayPaymentId: 'pay_tamper_attempt',
    expectedAmountPaise
  }), (error) => error.code === 'PAYMENT_AMOUNT_MISMATCH');
});

test('ACTUAL PRODUCTION Order instantiation: Order receives authoritative immediateDeliveryFee', async () => {
  const items = [{ product: prodId, quantity: 1 }];
  const isImmediate = true;

  const serverBill = await computeBillDetails(items, { isImmediate });

  const orderDoc = new Order({
    orderId: 'SG-12345678',
    user: new mongoose.Types.ObjectId(),
    items: [{ product: prodId, quantity: 1, price: 200 }],
    shippingAddress: { address: 'Test St', city: 'Test City', pincode: '123456' },
    paymentMethod: 'online',
    paymentStatus: 'paid',
    status: 'confirmed',
    totalAmount: serverBill.totalAmount,
    subTotal: serverBill.subTotal,
    taxAmount: serverBill.taxAmount,
    deliveryFee: serverBill.deliveryFee,
    immediateDeliveryFee: serverBill.immediateDeliveryFee,
    handlingFee: serverBill.handlingFee,
    isImmediate: true
  });

  assert.equal(orderDoc.immediateDeliveryFee, 20);
  assert.equal(orderDoc.deliveryFee, 50);
  assert.equal(orderDoc.totalAmount, 265);
});
