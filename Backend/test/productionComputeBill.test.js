import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import GlobalSetting from '../src/models/GlobalSetting.js';
import PromoCode from '../src/models/PromoCode.js';
import PromoUsage from '../src/models/PromoUsage.js';
import { computeBillDetails } from '../src/controllers/orderController.js';

// Save original methods for 100% leak-proof isolation
const originalProductFindById = Product.findById;
const originalGlobalSettingFindOne = GlobalSetting.findOne;
const originalPromoCodeFindById = PromoCode.findById;
const originalPromoUsageFindOne = PromoUsage.findOne;

const mockProductMap = new Map();
const prod100Id = new mongoose.Types.ObjectId().toString();
const prod600Id = new mongoose.Types.ObjectId().toString();

mockProductMap.set(prod100Id, { name: 'Item 100', basePrice: 100, price: 100 });
mockProductMap.set(prod600Id, { name: 'Item 600', basePrice: 600, price: 600 });

let mockGlobalSetting;

test.beforeEach(() => {
  mockGlobalSetting = {
    defaultTaxRate: 5,
    baseDeliveryFee: 30,
    surgeMultiplier: 1,
    freeDeliveryThreshold: 500,
    handlingFee: 5,
    immediateDeliveryEnabled: true,
    immediateDeliveryFee: 20,
    platformCommissionRate: 10
  };

  Product.findById = function(id) {
    const p = mockProductMap.get(String(id));
    return Promise.resolve(p ? { ...p, _id: id } : null);
  };

  GlobalSetting.findOne = function() {
    return Promise.resolve(mockGlobalSetting);
  };
});

test.afterEach(() => {
  Product.findById = originalProductFindById;
  GlobalSetting.findOne = originalGlobalSettingFindOne;
  PromoCode.findById = originalPromoCodeFindById;
  PromoUsage.findOne = originalPromoUsageFindOne;
});

test('ACTUAL PRODUCTION computeBillDetails: Scheduled delivery -> immediate fee = 0', async () => {
  const bill = await computeBillDetails(
    [{ product: prod100Id, quantity: 2 }], // subtotal = 200
    { isImmediate: false }
  );

  assert.equal(bill.subTotal, 200);
  assert.equal(bill.taxAmount, 10);
  assert.equal(bill.baseDeliveryFee, 30);
  assert.equal(bill.immediateDeliveryFee, 0);
  assert.equal(bill.deliveryFee, 30);
  assert.equal(bill.handlingFee, 5);
  assert.equal(bill.totalAmount, 245); // 200 + 10 + 30 + 5
});

test('ACTUAL PRODUCTION computeBillDetails: Immediate delivery enabled -> immediate fee applied', async () => {
  const bill = await computeBillDetails(
    [{ product: prod100Id, quantity: 2 }], // subtotal = 200
    { isImmediate: true }
  );

  assert.equal(bill.subTotal, 200);
  assert.equal(bill.taxAmount, 10);
  assert.equal(bill.baseDeliveryFee, 30);
  assert.equal(bill.immediateDeliveryFee, 20);
  assert.equal(bill.deliveryFee, 50); // 30 + 20
  assert.equal(bill.handlingFee, 5);
  assert.equal(bill.totalAmount, 265); // 200 + 10 + 50 + 5
});

test('ACTUAL PRODUCTION computeBillDetails: Dynamic surcharge changes in GlobalSetting (0 -> 15 -> 35)', async () => {
  // Test zero fee configured by admin
  mockGlobalSetting.immediateDeliveryFee = 0;
  let bill = await computeBillDetails([{ product: prod100Id, quantity: 2 }], { isImmediate: true });
  assert.equal(bill.immediateDeliveryFee, 0);
  assert.equal(bill.deliveryFee, 30);

  // Test 15 INR configured by admin
  mockGlobalSetting.immediateDeliveryFee = 15;
  bill = await computeBillDetails([{ product: prod100Id, quantity: 2 }], { isImmediate: true });
  assert.equal(bill.immediateDeliveryFee, 15);
  assert.equal(bill.deliveryFee, 45);

  // Test 35 INR configured by admin
  mockGlobalSetting.immediateDeliveryFee = 35;
  bill = await computeBillDetails([{ product: prod100Id, quantity: 2 }], { isImmediate: true });
  assert.equal(bill.immediateDeliveryFee, 35);
  assert.equal(bill.deliveryFee, 65);
});

test('ACTUAL PRODUCTION computeBillDetails: Immediate delivery disabled in settings -> immediate fee = 0', async () => {
  mockGlobalSetting.immediateDeliveryEnabled = false;
  const bill = await computeBillDetails(
    [{ product: prod100Id, quantity: 2 }],
    { isImmediate: true }
  );

  assert.equal(bill.immediateDeliveryFee, 0);
  assert.equal(bill.deliveryFee, 30);
});

test('ACTUAL PRODUCTION computeBillDetails: Free delivery threshold + immediate -> only base waived', async () => {
  const bill = await computeBillDetails(
    [{ product: prod600Id, quantity: 1 }], // subtotal = 600 >= 500 threshold
    { isImmediate: true }
  );

  assert.equal(bill.subTotal, 600);
  assert.equal(bill.taxAmount, 30);
  assert.equal(bill.baseDeliveryFee, 0); // waived
  assert.equal(bill.immediateDeliveryFee, 20); // payable
  assert.equal(bill.deliveryFee, 20);
  assert.equal(bill.totalAmount, 655); // 600 + 30 + 20 + 5
});

test('ACTUAL PRODUCTION computeBillDetails: FreeShipping promo + immediate -> only base waived', async () => {
  const promoId = new mongoose.Types.ObjectId().toString();
  PromoCode.findById = function(id) {
    return Promise.resolve({
      _id: promoId,
      code: 'FREESHIP',
      isActive: true,
      validFrom: new Date('2020-01-01'),
      validUntil: new Date('2030-01-01'),
      minOrderValue: 100,
      discountType: 'FreeShipping'
    });
  };

  const bill = await computeBillDetails(
    [{ product: prod100Id, quantity: 3 }], // subtotal = 300
    { promoId, isImmediate: true }
  );

  assert.equal(bill.subTotal, 300);
  assert.equal(bill.baseDeliveryFee, 30);
  assert.equal(bill.immediateDeliveryFee, 20);
  assert.equal(bill.deliveryFee, 50);
  assert.equal(bill.discountAmount, 30); // only base fee discounted
  assert.equal(bill.totalAmount, 340); // 300 + 15 + 50 + 5 - 30 (includes 20 immediate fee)
});

test('ACTUAL PRODUCTION computeBillDetails: POS -> all delivery & handling fees = 0', async () => {
  const bill = await computeBillDetails(
    [{ product: prod100Id, quantity: 2 }],
    { orderSource: 'pos', isImmediate: true }
  );

  assert.equal(bill.baseDeliveryFee, 0);
  assert.equal(bill.immediateDeliveryFee, 0);
  assert.equal(bill.deliveryFee, 0);
  assert.equal(bill.handlingFee, 0);
  assert.equal(bill.totalAmount, 210); // subtotal 200 + tax 10
});

test('ACTUAL PRODUCTION computeBillDetails: Tax is strictly calculated on item subTotal only', async () => {
  const bill = await computeBillDetails(
    [{ product: prod100Id, quantity: 1 }], // subtotal = 100
    { isImmediate: true }
  );

  assert.equal(bill.taxAmount, 5); // 5% of 100, delivery fee not taxed
});
