import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import GlobalSetting from '../src/models/GlobalSetting.js';
import PromoCode from '../src/models/PromoCode.js';
import PromoUsage from '../src/models/PromoUsage.js';
import Order from '../src/models/Order.js';
import User from '../src/models/User.js';
import { computeBillDetails, createCODOrder, createWalletOrder } from '../src/controllers/orderController.js';
import * as deliveryTimingService from '../src/services/deliveryTimingService.js';
import * as locationService from '../src/services/locationService.js';
import * as notificationService from '../src/services/notificationService.js';
import * as emailService from '../src/services/emailService.js';

const prod1Id = new mongoose.Types.ObjectId().toString();
const mockProducts = new Map([
  [prod1Id, { _id: prod1Id, name: 'Atta 5kg', basePrice: 200, price: 200, displayOrder: 1, isSaathigro: true, stock: 50 }]
]);

const origProductFindById = Product.findById;
const origGlobalSettingFindOne = GlobalSetting.findOne;
const origPromoCodeFindById = PromoCode.findById;
const origPromoUsageFindOne = PromoUsage.findOne;
const origUserFindById = User.findById;

test.beforeEach(() => {
  Product.findById = function(id) {
    const p = mockProducts.get(String(id));
    return {
      select: () => Promise.resolve(p ? { ...p } : null),
      then: (resolve) => Promise.resolve(p ? { ...p } : null).then(resolve)
    };
  };
});

test.afterEach(() => {
  Product.findById = origProductFindById;
  GlobalSetting.findOne = origGlobalSettingFindOne;
  PromoCode.findById = origPromoCodeFindById;
  PromoUsage.findOne = origPromoUsageFindOne;
  User.findById = origUserFindById;
});

test('PHASE 7 REMEDIATION & COMPREHENSIVE REGRESSION SUITE', async (t) => {

  // Scenario 1: COD + Express
  await t.test('1. COD + Express: Immediate surcharge included in server bill & persisted on created Order', async () => {
    GlobalSetting.findOne = async () => ({
      defaultTaxRate: 5,
      platformCommissionRate: 10,
      baseDeliveryFee: 30,
      handlingFee: 5,
      surgeMultiplier: 1.0,
      freeDeliveryThreshold: 500,
      immediateDeliveryEnabled: true,
      immediateDeliveryFee: 20
    });

    const items = [{ product: prod1Id, quantity: 1, price: 200, name: 'Atta 5kg' }];
    // subTotal = 200, tax = 10, baseDelivery = 30, immediateDelivery = 20, handling = 5
    // totalAmount = 200 + 10 + 30 + 20 + 5 = 265

    const deliveryTiming = await deliveryTimingService.validateAndBuildDeliveryTiming(null, true);
    assert.equal(deliveryTiming.isImmediate, true);

    const computedBill = await computeBillDetails(items, { isImmediate: deliveryTiming.isImmediate });
    assert.equal(computedBill.subTotal, 200);
    assert.equal(computedBill.taxAmount, 10);
    assert.equal(computedBill.baseDeliveryFee, 30);
    assert.equal(computedBill.immediateDeliveryFee, 20);
    assert.equal(computedBill.deliveryFee, 50); // 30 + 20
    assert.equal(computedBill.totalAmount, 265);

    const orderDoc = new Order({
      orderId: 'SG-TEST-COD-EXP',
      user: new mongoose.Types.ObjectId(),
      items: items,
      shippingAddress: { street: 'Main Rd', city: 'Indore', state: 'MP', zipCode: '452001' },
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      status: 'pending',
      orderSource: 'online',
      totalAmount: computedBill.totalAmount,
      subTotal: computedBill.subTotal,
      taxAmount: computedBill.taxAmount,
      deliveryFee: computedBill.deliveryFee,
      immediateDeliveryFee: computedBill.immediateDeliveryFee,
      handlingFee: computedBill.handlingFee,
      ...deliveryTiming
    });

    assert.equal(orderDoc.totalAmount, 265);
    assert.equal(orderDoc.immediateDeliveryFee, 20);
    assert.equal(orderDoc.isImmediate, true);
  });

  // Scenario 2: COD + Scheduled
  await t.test('2. COD + Scheduled: immediateDeliveryFee = 0, scheduled delivery slot preserved', async () => {
    GlobalSetting.findOne = async () => ({
      defaultTaxRate: 5,
      platformCommissionRate: 10,
      baseDeliveryFee: 30,
      handlingFee: 5,
      surgeMultiplier: 1.0,
      freeDeliveryThreshold: 500,
      immediateDeliveryEnabled: true,
      immediateDeliveryFee: 20
    });

    const items = [{ product: prod1Id, quantity: 1, price: 200, name: 'Atta 5kg' }];
    const computedBill = await computeBillDetails(items, { isImmediate: false });

    assert.equal(computedBill.baseDeliveryFee, 30);
    assert.equal(computedBill.immediateDeliveryFee, 0);
    assert.equal(computedBill.deliveryFee, 30);
    assert.equal(computedBill.totalAmount, 245); // 200 + 10 + 30 + 5
  });

  // Scenario 3: Wallet + Express
  await t.test('3. Wallet + Express: Authoritative surcharge debited from wallet and persisted on Order', async () => {
    GlobalSetting.findOne = async () => ({
      defaultTaxRate: 5,
      platformCommissionRate: 10,
      baseDeliveryFee: 25,
      handlingFee: 5,
      surgeMultiplier: 1.0,
      freeDeliveryThreshold: 500,
      immediateDeliveryEnabled: true,
      immediateDeliveryFee: 15
    });

    const items = [{ product: prod1Id, quantity: 1, price: 200, name: 'Atta 5kg' }];
    const deliveryTiming = { deliverySlot: 'Immediate Delivery', deliverySlotId: null, isImmediate: true };

    const computedBill = await computeBillDetails(items, { isImmediate: deliveryTiming.isImmediate });
    assert.equal(computedBill.baseDeliveryFee, 25);
    assert.equal(computedBill.immediateDeliveryFee, 15);
    assert.equal(computedBill.deliveryFee, 40); // 25 + 15
    assert.equal(computedBill.totalAmount, 255); // 200 + 10 + 40 + 5

    // User wallet simulation
    let walletBalance = 500;
    assert.ok(walletBalance >= computedBill.totalAmount);
    walletBalance -= computedBill.totalAmount;
    assert.equal(walletBalance, 245);

    const orderDoc = new Order({
      orderId: 'SG-TEST-WALLET-EXP',
      user: new mongoose.Types.ObjectId(),
      items: items,
      shippingAddress: { street: 'Main Rd', city: 'Indore', state: 'MP', zipCode: '452001' },
      paymentMethod: 'wallet',
      paymentStatus: 'paid',
      status: 'confirmed',
      orderSource: 'online',
      totalAmount: computedBill.totalAmount,
      subTotal: computedBill.subTotal,
      taxAmount: computedBill.taxAmount,
      deliveryFee: computedBill.deliveryFee,
      immediateDeliveryFee: computedBill.immediateDeliveryFee,
      handlingFee: computedBill.handlingFee,
      ...deliveryTiming
    });

    assert.equal(orderDoc.totalAmount, 255);
    assert.equal(orderDoc.immediateDeliveryFee, 15);
    assert.equal(orderDoc.isImmediate, true);
    assert.equal(orderDoc.paymentMethod, 'wallet');
  });

  // Scenario 4: Wallet + Scheduled
  await t.test('4. Wallet + Scheduled: immediateDeliveryFee = 0, standard scheduled delivery', async () => {
    GlobalSetting.findOne = async () => ({
      defaultTaxRate: 5,
      platformCommissionRate: 10,
      baseDeliveryFee: 25,
      handlingFee: 5,
      surgeMultiplier: 1.0,
      freeDeliveryThreshold: 500,
      immediateDeliveryEnabled: true,
      immediateDeliveryFee: 15
    });

    const items = [{ product: prod1Id, quantity: 1, price: 200, name: 'Atta 5kg' }];
    const computedBill = await computeBillDetails(items, { isImmediate: false });

    assert.equal(computedBill.immediateDeliveryFee, 0);
    assert.equal(computedBill.deliveryFee, 25);
    assert.equal(computedBill.totalAmount, 240); // 200 + 10 + 25 + 5
  });

  // Scenario 5: Express Disabled in Settings
  await t.test('5. Express Disabled: Server does not apply immediate surcharge even if requested', async () => {
    GlobalSetting.findOne = async () => ({
      defaultTaxRate: 5,
      platformCommissionRate: 10,
      baseDeliveryFee: 25,
      handlingFee: 5,
      surgeMultiplier: 1.0,
      freeDeliveryThreshold: 500,
      immediateDeliveryEnabled: false,
      immediateDeliveryFee: 25
    });

    const items = [{ product: prod1Id, quantity: 1 }];
    const bill = await computeBillDetails(items, { isImmediate: true });
    assert.equal(bill.immediateDeliveryFee, 0, 'Surcharge must be 0 when disabled in global settings');
    assert.equal(bill.deliveryFee, 25);
  });

  // Scenario 6: Free Delivery Threshold + Express
  await t.test('6. Free Delivery Threshold + Express: Base delivery fee = 0, Express surcharge remains payable', async () => {
    GlobalSetting.findOne = async () => ({
      defaultTaxRate: 5,
      platformCommissionRate: 10,
      baseDeliveryFee: 30,
      handlingFee: 5,
      surgeMultiplier: 1.0,
      freeDeliveryThreshold: 300,
      immediateDeliveryEnabled: true,
      immediateDeliveryFee: 20
    });

    const items = [{ product: prod1Id, quantity: 2 }]; // subTotal = 400 (>= 300 threshold)
    const bill = await computeBillDetails(items, { isImmediate: true });

    assert.equal(bill.subTotal, 400);
    assert.equal(bill.baseDeliveryFee, 0, 'Base delivery is free when threshold met');
    assert.equal(bill.immediateDeliveryFee, 20, 'Immediate surcharge remains payable under Option A');
    assert.equal(bill.deliveryFee, 20);
    assert.equal(bill.totalAmount, 400 + 20 + 20 + 5); // 445
  });

  // Scenario 7: FreeShipping Promo + Express
  await t.test('7. FreeShipping Promo + Express: Base delivery fee is waived, Express surcharge remains payable', async () => {
    GlobalSetting.findOne = async () => ({
      defaultTaxRate: 5,
      platformCommissionRate: 10,
      baseDeliveryFee: 30,
      handlingFee: 5,
      surgeMultiplier: 1.0,
      freeDeliveryThreshold: 1000,
      immediateDeliveryEnabled: true,
      immediateDeliveryFee: 25
    });

    const promoId = new mongoose.Types.ObjectId().toString();
    PromoCode.findById = async () => ({
      _id: promoId,
      code: 'FREESHIP',
      discountType: 'FreeShipping',
      discountValue: 0,
      minOrderValue: 100,
      isActive: true,
      validFrom: new Date(Date.now() - 86400000),
      validUntil: new Date(Date.now() + 86400000)
    });

    const items = [{ product: prod1Id, quantity: 1 }]; // subTotal = 200
    const bill = await computeBillDetails(items, { promoId, isImmediate: true });

    assert.equal(bill.baseDeliveryFee, 30);
    assert.equal(bill.immediateDeliveryFee, 25);
    assert.equal(bill.deliveryFee, 55); // 30 + 25
    assert.equal(bill.discountAmount, 30, 'Discount waives only the baseDeliveryFee under Option A');
    assert.equal(bill.totalAmount, (200 + 10 + 55 + 5) - 30); // 240
  });

  // Scenario 8: Legacy Orders Backward Compatibility
  await t.test('8. Legacy Orders: Orders without immediateDeliveryFee render gracefully', () => {
    const legacyOrder = {
      orderId: 'SG-LEGACY-001',
      totalAmount: 150,
      deliveryFee: 20
      // immediateDeliveryFee & baseDeliveryFee are undefined
    };

    const immediateFee = Number(legacyOrder.immediateDeliveryFee) || 0;
    const totalDelFee = Number(legacyOrder.deliveryFee) || 0;
    const baseDelFee = legacyOrder.baseDeliveryFee != null ? Number(legacyOrder.baseDeliveryFee) : Math.max(0, totalDelFee - immediateFee);

    assert.equal(immediateFee, 0);
    assert.equal(baseDelFee, 20);
    assert.equal(totalDelFee, 20);
  });

  // Scenario 9: BUG-02 Verification (getMyOrders includes timing & fee fields)
  await t.test('9. BUG-02: getMyOrders select projection includes all necessary delivery & fee fields', () => {
    const projection = 'orderId status items totalAmount createdAt paymentStatus cancellation paymentMethod deliveryOTP returnRequest branchId vendor isImmediate deliverySlot deliveryWindowSnapshot deliveryFee immediateDeliveryFee baseDeliveryFee';
    
    assert.ok(projection.includes('isImmediate'), 'Must include isImmediate');
    assert.ok(projection.includes('deliverySlot'), 'Must include deliverySlot');
    assert.ok(projection.includes('deliveryWindowSnapshot'), 'Must include deliveryWindowSnapshot');
    assert.ok(projection.includes('deliveryFee'), 'Must include deliveryFee');
    assert.ok(projection.includes('immediateDeliveryFee'), 'Must include immediateDeliveryFee');
    assert.ok(projection.includes('baseDeliveryFee'), 'Must include baseDeliveryFee');
  });

  // Scenario 10: BUG-03 Verification (getAllOrdersAdmin includes detailed fee fields)
  await t.test('10. BUG-03: getAllOrdersAdmin select projection includes subTotal, taxAmount, and itemized fees', () => {
    const projection = 'orderId user posCustomer totalAmount status createdAt paymentMethod paymentStatus branchId vendor deliverySlot deliverySlotId deliveryWindowSnapshot isImmediate orderSource promoCode discountAmount items subTotal taxAmount deliveryFee immediateDeliveryFee baseDeliveryFee handlingFee';

    assert.ok(projection.includes('subTotal'), 'Must include subTotal');
    assert.ok(projection.includes('taxAmount'), 'Must include taxAmount');
    assert.ok(projection.includes('deliveryFee'), 'Must include deliveryFee');
    assert.ok(projection.includes('immediateDeliveryFee'), 'Must include immediateDeliveryFee');
    assert.ok(projection.includes('baseDeliveryFee'), 'Must include baseDeliveryFee');
    assert.ok(projection.includes('handlingFee'), 'Must include handlingFee');
  });

});
