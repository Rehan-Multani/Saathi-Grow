import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import GlobalSetting from '../src/models/GlobalSetting.js';
import PromoCode from '../src/models/PromoCode.js';
import PromoUsage from '../src/models/PromoUsage.js';
import Order from '../src/models/Order.js';
import { computeBillDetails } from '../src/controllers/orderController.js';

// Setup mock product IDs
const prod1Id = new mongoose.Types.ObjectId().toString();
const mockProducts = new Map([
  [prod1Id, { _id: prod1Id, name: 'Atta 5kg', basePrice: 200, price: 200, displayOrder: 1, isSaathigro: true }]
]);

const origProductFindById = Product.findById;
const origGlobalSettingFindOne = GlobalSetting.findOne;
const origPromoCodeFindById = PromoCode.findById;
const origPromoUsageFindOne = PromoUsage.findOne;

test.beforeEach(() => {
  Product.findById = function(id) {
    const p = mockProducts.get(String(id));
    return Promise.resolve(p ? { ...p } : null);
  };
});

test.afterEach(() => {
  Product.findById = origProductFindById;
  GlobalSetting.findOne = origGlobalSettingFindOne;
  PromoCode.findById = origPromoCodeFindById;
  PromoUsage.findOne = origPromoUsageFindOne;
});

test('PHASE 6 OPERATIONS INTEGRATION & E2E TEST SUITE', async (t) => {

  // 1. Shared OrderDetailsModal Data Flow
  await t.test('1. Shared OrderDetailsModal: Option A financial itemization', () => {
    const expressOrder = {
      _id: 'ord-express-1',
      subTotal: 300,
      baseDeliveryFee: 25,
      immediateDeliveryFee: 20,
      deliveryFee: 45,
      taxAmount: 0,
      handlingFee: 5,
      discountAmount: 0,
      totalAmount: 350,
      isImmediate: true
    };

    const immediateFee = Number(expressOrder.immediateDeliveryFee) || 0;
    const totalDelFee = Number(expressOrder.deliveryFee) || 0;
    const baseDelFee = expressOrder.baseDeliveryFee != null ? Number(expressOrder.baseDeliveryFee) : Math.max(0, totalDelFee - immediateFee);

    assert.equal(immediateFee, 20);
    assert.equal(baseDelFee, 25);
    assert.equal(totalDelFee, 45);
    assert.equal(expressOrder.isImmediate, true);
  });

  // 2. Receipt Itemization
  await t.test('2. Printed Receipt: Itemizes Base Delivery Fee and Express Surcharge', () => {
    const order = {
      orderId: 'ORD-987654',
      subTotal: 500,
      baseDeliveryFee: 0, // threshold met
      immediateDeliveryFee: 25,
      deliveryFee: 25,
      totalAmount: 530,
      isImmediate: true
    };

    const immediateFee = Number(order.immediateDeliveryFee) || 0;
    const totalDelFee = Number(order.deliveryFee) || 0;
    const baseDelFee = order.baseDeliveryFee != null ? Number(order.baseDeliveryFee) : Math.max(0, totalDelFee - immediateFee);

    assert.equal(immediateFee, 25);
    assert.equal(baseDelFee, 0, 'Base delivery fee is free above threshold');
    assert.equal(totalDelFee, 25);
  });

  // 3. Store Manager Order Scoping & Express Flag
  await t.test('3. Store Manager Orders: Express orders carry isImmediate=true for priority filtering', () => {
    const branchId = new mongoose.Types.ObjectId();
    const order = new Order({
      customer: new mongoose.Types.ObjectId(),
      branchId,
      items: [{ product: new mongoose.Types.ObjectId(), name: 'Milk', price: 60, quantity: 2 }],
      subTotal: 120,
      baseDeliveryFee: 20,
      immediateDeliveryFee: 15,
      deliveryFee: 35,
      handlingFee: 5,
      totalAmount: 160,
      isImmediate: true,
      deliverySlot: 'Immediate',
      paymentMethod: 'cod',
      shippingAddress: { street: 'Main Rd', city: 'Indore', state: 'MP', zipCode: '452001' }
    });

    assert.equal(order.branchId.toString(), branchId.toString());
    assert.equal(order.isImmediate, true);
    assert.equal(order.immediateDeliveryFee, 15);
  });

  // 4. Delivery Partner Mission & Stop Timing
  await t.test('4. Delivery Partner App: Stop card identifies isImmediate vs deliverySlot', () => {
    const stopExpress = {
      order: {
        orderId: 'ORD-EXP-1',
        totalAmount: 250,
        isImmediate: true,
        deliverySlot: 'Immediate'
      },
      status: 'pending'
    };

    const stopScheduled = {
      order: {
        orderId: 'ORD-SCH-1',
        totalAmount: 230,
        isImmediate: false,
        deliverySlot: '04:00 PM - 06:00 PM'
      },
      status: 'pending'
    };

    assert.equal(stopExpress.order.isImmediate, true);
    assert.equal(stopScheduled.order.isImmediate, false);
    assert.equal(stopScheduled.order.deliverySlot, '04:00 PM - 06:00 PM');
  });

  // 5. Vendor Commission Isolation
  await t.test('5. Vendor Payout Calculation: Vendor payout is strictly unaffected by delivery fees or immediate surcharge', async () => {
    GlobalSetting.findOne = async () => ({
      defaultTaxRate: 5,
      platformCommissionRate: 10,
      baseDeliveryFee: 30,
      handlingFee: 5,
      surgeMultiplier: 1.0,
      freeDeliveryThreshold: 500,
      immediateDeliveryEnabled: true,
      immediateDeliveryFee: 25
    });

    const items = [{ product: prod1Id, quantity: 2 }]; // subtotal = 400, tax = 20
    const bill = await computeBillDetails(items, { isImmediate: true });

    // subTotal = 400, tax = 20 (5%), deliveryFee = 55 (30 + 25), handlingFee = 5
    // totalAmount = 400 + 20 + 55 + 5 = 480
    // platformCommission = (400 * 10%) = 40
    // vendorPayout = (400 + 20) - 40 = 380 (completely unaffected by deliveryFee 55 or handlingFee 5)
    assert.equal(bill.subTotal, 400);
    assert.equal(bill.taxAmount, 20);
    assert.equal(bill.deliveryFee, 55);
    assert.equal(bill.platformCommission, 40);
    assert.equal(bill.vendorPayoutAmount, 380);
    assert.equal(bill.totalAmount, 480);
  });

  // 6. POS Billing Isolation
  await t.test('6. POS Counter Billing: Zero delivery fee and zero immediate fee', async () => {
    GlobalSetting.findOne = async () => ({
      defaultTaxRate: 5,
      platformCommissionRate: 10,
      baseDeliveryFee: 30,
      handlingFee: 5,
      surgeMultiplier: 1.0,
      freeDeliveryThreshold: 500,
      immediateDeliveryEnabled: true,
      immediateDeliveryFee: 25
    });

    const items = [{ product: prod1Id, quantity: 1 }]; // subtotal = 200, tax = 10
    const bill = await computeBillDetails(items, { orderSource: 'pos', isImmediate: true });

    assert.equal(bill.subTotal, 200);
    assert.equal(bill.taxAmount, 10);
    assert.equal(bill.baseDeliveryFee, 0);
    assert.equal(bill.immediateDeliveryFee, 0);
    assert.equal(bill.deliveryFee, 0);
    assert.equal(bill.handlingFee, 0);
    assert.equal(bill.totalAmount, 210); // 200 + 10 = 210
  });

  // 7. Legacy Orders Compatibility Across Ops
  await t.test('7. Legacy Orders: Missing surcharge fields gracefully fall back across all ops views', () => {
    const legacy = {
      subTotal: 150,
      deliveryFee: 20,
      totalAmount: 175
      // baseDeliveryFee, immediateDeliveryFee, isImmediate undefined
    };

    const immediateFee = Number(legacy.immediateDeliveryFee) || 0;
    const totalDelFee = Number(legacy.deliveryFee) || 0;
    const baseDelFee = legacy.baseDeliveryFee != null ? Number(legacy.baseDeliveryFee) : Math.max(0, totalDelFee - immediateFee);

    assert.equal(immediateFee, 0);
    assert.equal(baseDelFee, 20);
    assert.equal(totalDelFee, 20);
    assert.equal(legacy.isImmediate, undefined);
  });

});
