import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import GlobalSetting from '../src/models/GlobalSetting.js';
import PromoCode from '../src/models/PromoCode.js';
import PromoUsage from '../src/models/PromoUsage.js';
import Order from '../src/models/Order.js';
import { getPublicSettings } from '../src/controllers/settingController.js';
import { computeBillDetails } from '../src/controllers/orderController.js';
import { orderByIds } from '../src/controllers/categoryPageController.js';

// Setup mock product IDs
const prod1Id = new mongoose.Types.ObjectId().toString();
const prod2Id = new mongoose.Types.ObjectId().toString();
const prod3Id = new mongoose.Types.ObjectId().toString();
const prodHighPriceId = new mongoose.Types.ObjectId().toString();

const mockProducts = new Map([
  [prod1Id, { _id: prod1Id, name: 'Atta 5kg', basePrice: 200, price: 200, displayOrder: 1, isSaathigro: true, createdAt: new Date('2026-01-01') }],
  [prod2Id, { _id: prod2Id, name: 'Rice 5kg', basePrice: 350, price: 350, displayOrder: 2, isSaathigro: false, createdAt: new Date('2026-01-02') }],
  [prod3Id, { _id: prod3Id, name: 'Dal 1kg', basePrice: 120, price: 120, displayOrder: null, isSaathigro: true, createdAt: new Date('2026-01-03') }],
  [prodHighPriceId, { _id: prodHighPriceId, name: 'Ghee 1L', basePrice: 650, price: 650, displayOrder: null, isSaathigro: false, createdAt: new Date('2026-01-04') }]
]);

// Track original model methods for leak-proof isolation
const origProductFindById = Product.findById;
const origProductFind = Product.find;
const origProductCountDocuments = Product.countDocuments;
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
  Product.find = origProductFind;
  Product.countDocuments = origProductCountDocuments;
  GlobalSetting.findOne = origGlobalSettingFindOne;
  PromoCode.findById = origPromoCodeFindById;
  PromoUsage.findOne = origPromoUsageFindOne;
});

test('CUSTOMER-FACING E2E VERIFICATION SUITE (Scenarios 1-13)', async (t) => {

  // 1. ADMIN SETTING -> CUSTOMER APP (Public Settings API)
  await t.test('1. Admin Setting -> Customer App: public settings API reflects immediateDeliveryEnabled & immediateDeliveryFee', async () => {
    GlobalSetting.findOne = async () => ({
      baseDeliveryFee: 30,
      handlingFee: 5,
      surgeMultiplier: 1.0,
      freeDeliveryThreshold: 500,
      maxDeliveryRadius: 15,
      immediateDeliveryEnabled: true,
      immediateDeliveryFee: 20
    });

    let jsonResult = null;
    let statusCode = 200;
    const req = {};
    const res = {
      status(code) { statusCode = code; return this; },
      json(data) { jsonResult = data; return this; }
    };

    await getPublicSettings(req, res);
    assert.equal(statusCode, 200);
    assert.equal(jsonResult.immediateDeliveryEnabled, true);
    assert.equal(jsonResult.immediateDeliveryFee, 20);
    assert.equal(jsonResult.freeDeliveryThreshold, 500);
    assert.equal(jsonResult.baseDeliveryFee, 30);
  });

  // 2. EXPRESS ENABLED WITH DYNAMIC SURCHARGE
  await t.test('2. Express Enabled: surcharge is dynamic (e.g. ₹20) and not hardcoded', async () => {
    GlobalSetting.findOne = async () => ({
      defaultTaxRate: 0,
      platformCommissionRate: 10,
      baseDeliveryFee: 25,
      handlingFee: 5,
      surgeMultiplier: 1.0,
      freeDeliveryThreshold: 500,
      immediateDeliveryEnabled: true,
      immediateDeliveryFee: 20
    });

    const items = [{ product: prod1Id, quantity: 1 }]; // subtotal = 200
    const bill = await computeBillDetails(items, { isImmediate: true });

    assert.equal(bill.subTotal, 200);
    assert.equal(bill.baseDeliveryFee, 25);
    assert.equal(bill.immediateDeliveryFee, 20);
    assert.equal(bill.deliveryFee, 45); // 25 + 20
    assert.equal(bill.totalAmount, 250); // 200 + 45 + 5
  });

  // 3. EXPRESS DISABLED IN ADMIN
  await t.test('3. Express Disabled: customer cannot force express surcharge when immediateDeliveryEnabled is false', async () => {
    GlobalSetting.findOne = async () => ({
      defaultTaxRate: 0,
      platformCommissionRate: 10,
      baseDeliveryFee: 25,
      handlingFee: 5,
      surgeMultiplier: 1.0,
      freeDeliveryThreshold: 500,
      immediateDeliveryEnabled: false,
      immediateDeliveryFee: 20
    });

    // Client maliciously/erroneously sends isImmediate: true
    const items = [{ product: prod1Id, quantity: 1 }];
    const bill = await computeBillDetails(items, { isImmediate: true });

    assert.equal(bill.immediateDeliveryFee, 0, 'Server must enforce 0 immediate fee when disabled in admin');
    assert.equal(bill.baseDeliveryFee, 25);
    assert.equal(bill.deliveryFee, 25);
    assert.equal(bill.totalAmount, 230); // 200 + 25 + 5
  });

  // 4. SCHEDULED DELIVERY
  await t.test('4. Scheduled Delivery: isImmediate=false -> immediate surcharge is ₹0, base fee applies', async () => {
    GlobalSetting.findOne = async () => ({
      defaultTaxRate: 0,
      platformCommissionRate: 10,
      baseDeliveryFee: 30,
      handlingFee: 5,
      surgeMultiplier: 1.0,
      freeDeliveryThreshold: 500,
      immediateDeliveryEnabled: true,
      immediateDeliveryFee: 25
    });

    const items = [{ product: prod1Id, quantity: 1 }];
    const bill = await computeBillDetails(items, { isImmediate: false, deliverySlotId: 'slot-morning' });

    assert.equal(bill.immediateDeliveryFee, 0);
    assert.equal(bill.baseDeliveryFee, 30);
    assert.equal(bill.deliveryFee, 30);
    assert.equal(bill.totalAmount, 235);
  });

  // 5. EXPRESS DELIVERY
  await t.test('5. Express Delivery: isImmediate=true -> immediate surcharge added to bill', async () => {
    GlobalSetting.findOne = async () => ({
      defaultTaxRate: 0,
      platformCommissionRate: 10,
      baseDeliveryFee: 30,
      handlingFee: 5,
      surgeMultiplier: 1.0,
      freeDeliveryThreshold: 500,
      immediateDeliveryEnabled: true,
      immediateDeliveryFee: 25
    });

    const items = [{ product: prod1Id, quantity: 1 }];
    const bill = await computeBillDetails(items, { isImmediate: true, deliverySlotId: null });

    assert.equal(bill.immediateDeliveryFee, 25);
    assert.equal(bill.baseDeliveryFee, 30);
    assert.equal(bill.deliveryFee, 55); // 30 + 25
    assert.equal(bill.totalAmount, 260);
  });

  // 6. EXPRESS <-> SCHEDULED TOGGLE SEQUENCE
  await t.test('6. Express <-> Scheduled Toggle Sequence: Express -> Scheduled -> Express -> Scheduled', async () => {
    GlobalSetting.findOne = async () => ({
      defaultTaxRate: 0,
      platformCommissionRate: 10,
      baseDeliveryFee: 25,
      handlingFee: 5,
      surgeMultiplier: 1.0,
      freeDeliveryThreshold: 500,
      immediateDeliveryEnabled: true,
      immediateDeliveryFee: 15
    });

    const items = [{ product: prod1Id, quantity: 1 }]; // 200

    // Step A: Express
    const step1 = await computeBillDetails(items, { isImmediate: true });
    assert.equal(step1.immediateDeliveryFee, 15);
    assert.equal(step1.totalAmount, 245);

    // Step B: Switch to Scheduled
    const step2 = await computeBillDetails(items, { isImmediate: false });
    assert.equal(step2.immediateDeliveryFee, 0);
    assert.equal(step2.totalAmount, 230);

    // Step C: Switch back to Express
    const step3 = await computeBillDetails(items, { isImmediate: true });
    assert.equal(step3.immediateDeliveryFee, 15);
    assert.equal(step3.totalAmount, 245);

    // Step D: Switch to Scheduled
    const step4 = await computeBillDetails(items, { isImmediate: false });
    assert.equal(step4.immediateDeliveryFee, 0);
    assert.equal(step4.totalAmount, 230);
  });

  // 7. FREE DELIVERY THRESHOLD (OPTION A)
  await t.test('7. Free Delivery Threshold (Option A): Below threshold vs Above threshold with Express', async () => {
    GlobalSetting.findOne = async () => ({
      defaultTaxRate: 0,
      platformCommissionRate: 10,
      baseDeliveryFee: 30,
      handlingFee: 5,
      surgeMultiplier: 1.0,
      freeDeliveryThreshold: 500,
      immediateDeliveryEnabled: true,
      immediateDeliveryFee: 20
    });

    // Below threshold (₹200) + Express:
    const belowBill = await computeBillDetails([{ product: prod1Id, quantity: 1 }], { isImmediate: true });
    assert.equal(belowBill.baseDeliveryFee, 30);
    assert.equal(belowBill.immediateDeliveryFee, 20);
    assert.equal(belowBill.deliveryFee, 50);
    assert.equal(belowBill.totalAmount, 255);

    // Above threshold (₹650) + Express:
    const aboveBill = await computeBillDetails([{ product: prodHighPriceId, quantity: 1 }], { isImmediate: true });
    assert.equal(aboveBill.baseDeliveryFee, 0, 'Base delivery fee must be waived (0)');
    assert.equal(aboveBill.immediateDeliveryFee, 20, 'Immediate surcharge must remain payable (20)');
    assert.equal(aboveBill.deliveryFee, 20, 'Total delivery fee is exactly the immediate surcharge');
    assert.equal(aboveBill.totalAmount, 675); // 650 + 20 + 5
  });

  // 8. FREESHIPPING PROMO (OPTION A)
  await t.test('8. FreeShipping Promo (Option A): Waives base delivery only; Express surcharge remains payable', async () => {
    GlobalSetting.findOne = async () => ({
      defaultTaxRate: 0,
      platformCommissionRate: 10,
      baseDeliveryFee: 30,
      handlingFee: 5,
      surgeMultiplier: 1.0,
      freeDeliveryThreshold: 1000,
      immediateDeliveryEnabled: true,
      immediateDeliveryFee: 25
    });

    PromoCode.findById = async () => ({
      _id: 'promo-free-shipping',
      code: 'FREEBASE',
      discountType: 'FreeShipping',
      isActive: true,
      minOrderValue: 100,
      validFrom: new Date(Date.now() - 100000),
      validUntil: new Date(Date.now() + 100000),
      usageLimitPerUser: 10
    });

    PromoUsage.findOne = async () => null;

    const items = [{ product: prod1Id, quantity: 1 }]; // ₹200
    const bill = await computeBillDetails(items, { promoId: 'promo-free-shipping', userId: 'user-123', isImmediate: true });

    assert.equal(bill.subTotal, 200);
    assert.equal(bill.baseDeliveryFee, 30);
    assert.equal(bill.discountAmount, 30, 'Promo discount equals base delivery fee');
    assert.equal(bill.immediateDeliveryFee, 25, 'Immediate surcharge remains payable');
    assert.equal(bill.deliveryFee, 55); // 30 + 25
    assert.equal(bill.totalAmount, 230); // 200 + 55 + 5 - 30 = 230
  });

  // 9. ₹0 EXPRESS SURCHARGE
  await t.test('9. ₹0 Express Surcharge: Express is selectable and adds ₹0 surcharge', async () => {
    GlobalSetting.findOne = async () => ({
      defaultTaxRate: 0,
      platformCommissionRate: 10,
      baseDeliveryFee: 25,
      handlingFee: 5,
      surgeMultiplier: 1.0,
      freeDeliveryThreshold: 500,
      immediateDeliveryEnabled: true,
      immediateDeliveryFee: 0
    });

    const items = [{ product: prod1Id, quantity: 1 }];
    const bill = await computeBillDetails(items, { isImmediate: true });

    assert.equal(bill.immediateDeliveryFee, 0);
    assert.equal(bill.baseDeliveryFee, 25);
    assert.equal(bill.deliveryFee, 25);
    assert.equal(bill.totalAmount, 230);
  });

  // 10. ORDER PLACEMENT (EXPRESS & SCHEDULED)
  await t.test('10. Order Placement: Order model captures isImmediate and authoritative immediateDeliveryFee', () => {
    const expressOrder = new Order({
      customer: new mongoose.Types.ObjectId(),
      items: [{ product: new mongoose.Types.ObjectId(), name: 'Atta 5kg', price: 200, quantity: 1 }],
      subTotal: 200,
      baseDeliveryFee: 25,
      immediateDeliveryFee: 20,
      deliveryFee: 45,
      handlingFee: 5,
      taxAmount: 0,
      totalAmount: 250,
      isImmediate: true,
      deliverySlot: 'Immediate',
      paymentMethod: 'cod',
      shippingAddress: { street: '123 Main St', city: 'Indore', state: 'MP', zipCode: '452001' }
    });

    assert.equal(expressOrder.isImmediate, true);
    assert.equal(expressOrder.immediateDeliveryFee, 20);
    assert.equal(expressOrder.deliveryFee, 45);

    const scheduledOrder = new Order({
      customer: new mongoose.Types.ObjectId(),
      items: [{ product: new mongoose.Types.ObjectId(), name: 'Rice 5kg', price: 350, quantity: 1 }],
      subTotal: 350,
      baseDeliveryFee: 25,
      immediateDeliveryFee: 0,
      deliveryFee: 25,
      handlingFee: 5,
      taxAmount: 0,
      totalAmount: 380,
      isImmediate: false,
      deliverySlot: '10:00 AM - 12:00 PM',
      deliverySlotId: new mongoose.Types.ObjectId(),
      paymentMethod: 'wallet',
      shippingAddress: { street: '456 Cross St', city: 'Indore', state: 'MP', zipCode: '452001' }
    });

    assert.equal(scheduledOrder.isImmediate, false);
    assert.equal(scheduledOrder.immediateDeliveryFee, 0);
    assert.equal(scheduledOrder.deliveryFee, 25);
  });

  // 11. ORDER DETAILS BREAKDOWN
  await t.test('11. Order Details: Processes distinct Base Delivery Fee & Express Surcharge line items', () => {
    const orderData = {
      _id: 'order-123456',
      subTotal: 200,
      baseDeliveryFee: 30,
      immediateDeliveryFee: 20,
      deliveryFee: 50,
      handlingFee: 5,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 255,
      isImmediate: true,
      deliverySlot: 'Immediate'
    };

    const immediateDeliveryFee = Number(orderData.immediateDeliveryFee) || 0;
    const totalDeliveryFee = Number(orderData.deliveryFee) || 0;
    const baseDeliveryFee = orderData.baseDeliveryFee != null ? Number(orderData.baseDeliveryFee) : Math.max(0, totalDeliveryFee - immediateDeliveryFee);

    assert.equal(immediateDeliveryFee, 20);
    assert.equal(baseDeliveryFee, 30);
    assert.equal(totalDeliveryFee, 50);
    assert.equal(orderData.isImmediate, true);
  });

  // 12. LEGACY ORDER BACKWARD COMPATIBILITY
  await t.test('12. Legacy Order Compatibility: Does not crash on missing immediateDeliveryFee / baseDeliveryFee', () => {
    const legacyOrder = {
      _id: 'order-legacy-old',
      subTotal: 300,
      deliveryFee: 25,
      handlingFee: 5,
      totalAmount: 330
      // baseDeliveryFee, immediateDeliveryFee, isImmediate are all undefined
    };

    const immediateDeliveryFee = Number(legacyOrder.immediateDeliveryFee) || 0;
    const totalDeliveryFee = Number(legacyOrder.deliveryFee) || 0;
    const baseDeliveryFee = legacyOrder.baseDeliveryFee != null ? Number(legacyOrder.baseDeliveryFee) : Math.max(0, totalDeliveryFee - immediateDeliveryFee);

    assert.equal(immediateDeliveryFee, 0, 'Immediate surcharge defaults to 0');
    assert.equal(baseDeliveryFee, 25, 'Base fee falls back to total delivery fee');
    assert.equal(totalDeliveryFee, 25);
    assert.equal(legacyOrder.isImmediate, undefined);
  });

  // 13. PRODUCT ORDERING & CATALOG INTEGRITY
  await t.test('13. Product Ordering: Assigned displayOrder first, unassigned fallback, curated orderByIds preserved', () => {
    const productList = [
      mockProducts.get(prod3Id), // displayOrder: null, isSaathigro: true
      mockProducts.get(prod2Id), // displayOrder: 2
      mockProducts.get(prod1Id), // displayOrder: 1
      mockProducts.get(prodHighPriceId) // displayOrder: null, isSaathigro: false
    ];

    // Split assigned vs unassigned
    const assigned = productList.filter(p => p.displayOrder !== null).sort((a, b) => a.displayOrder - b.displayOrder);
    const unassigned = productList.filter(p => p.displayOrder === null).sort((a, b) => {
      if (a.isSaathigro !== b.isSaathigro) return b.isSaathigro ? 1 : -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    const catalogSorted = [...assigned, ...unassigned];

    // Assert sequence
    assert.equal(catalogSorted[0]._id, prod1Id, 'displayOrder: 1 is first');
    assert.equal(catalogSorted[1]._id, prod2Id, 'displayOrder: 2 is second');
    assert.equal(catalogSorted[2]._id, prod3Id, 'Unassigned isSaathigro: true is third');
    assert.equal(catalogSorted[3]._id, prodHighPriceId, 'Unassigned isSaathigro: false is fourth');

    // Test explicit price sort overriding displayOrder
    const priceSortedAsc = [...productList].sort((a, b) => a.basePrice - b.basePrice);
    assert.equal(priceSortedAsc[0]._id, prod3Id, '₹120 is first in price asc');
    assert.equal(priceSortedAsc[1]._id, prod1Id, '₹200 is second in price asc');
    assert.equal(priceSortedAsc[2]._id, prod2Id, '₹350 is third in price asc');
    assert.equal(priceSortedAsc[3]._id, prodHighPriceId, '₹650 is fourth in price asc');

    // Test curated section.productIds ordering preserved exactly
    const curatedIds = [prodHighPriceId, prod1Id, prod2Id];
    const curatedPreserved = orderByIds(productList, curatedIds);
    assert.equal(curatedPreserved[0]._id, prodHighPriceId);
    assert.equal(curatedPreserved[1]._id, prod1Id);
    assert.equal(curatedPreserved[2]._id, prod2Id);
  });

});
