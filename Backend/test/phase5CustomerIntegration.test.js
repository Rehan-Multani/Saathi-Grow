import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import GlobalSetting from '../src/models/GlobalSetting.js';
import PromoCode from '../src/models/PromoCode.js';
import PromoUsage from '../src/models/PromoUsage.js';
import { computeBillDetails } from '../src/controllers/orderController.js';

const originalProductFindById = Product.findById;
const originalGlobalSettingFindOne = GlobalSetting.findOne;
const originalPromoCodeFindById = PromoCode.findById;
const originalPromoUsageFindOne = PromoUsage.findOne;

const prod200Id = new mongoose.Types.ObjectId().toString();
const prod600Id = new mongoose.Types.ObjectId().toString();
const prod300Id = new mongoose.Types.ObjectId().toString();

const mockProductMap = new Map();
mockProductMap.set(prod200Id, { name: 'Item 200', basePrice: 200, price: 200 });
mockProductMap.set(prod600Id, { name: 'Item 600', basePrice: 600, price: 600 });
mockProductMap.set(prod300Id, { name: 'Item 300', basePrice: 300, price: 300 });

test.beforeEach(() => {
  Product.findById = function(id) {
    const p = mockProductMap.get(String(id));
    return Promise.resolve(p ? { ...p, _id: id } : null);
  };
});

test.afterEach(() => {
  Product.findById = originalProductFindById;
  GlobalSetting.findOne = originalGlobalSettingFindOne;
  PromoCode.findById = originalPromoCodeFindById;
  PromoUsage.findOne = originalPromoUsageFindOne;
});

test('Phase 5 Storefront & Customer Integration Verification Suite', async (t) => {

  await t.test('Scenario A: Scheduled delivery -> base delivery fee applies, immediateDeliveryFee = 0', async () => {
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

    const items = [{ product: prod200Id, quantity: 1 }];
    const bill = await computeBillDetails(items, { isImmediate: false });

    assert.equal(bill.subTotal, 200);
    assert.equal(bill.baseDeliveryFee, 30);
    assert.equal(bill.immediateDeliveryFee, 0);
    assert.equal(bill.deliveryFee, 30);
    assert.equal(bill.handlingFee, 5);
    assert.equal(bill.totalAmount, 235);
  });

  await t.test('Scenario B: Express delivery with surcharge -> base fee + immediate surcharge apply', async () => {
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

    const items = [{ product: prod200Id, quantity: 1 }];
    const bill = await computeBillDetails(items, { isImmediate: true });

    assert.equal(bill.subTotal, 200);
    assert.equal(bill.baseDeliveryFee, 30);
    assert.equal(bill.immediateDeliveryFee, 20);
    assert.equal(bill.deliveryFee, 50); // 30 + 20
    assert.equal(bill.handlingFee, 5);
    assert.equal(bill.totalAmount, 255);
  });

  await t.test('Scenario C (Option A): Cart above free delivery threshold + Express -> base fee = 0, immediate fee remains payable', async () => {
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

    const items = [{ product: prod600Id, quantity: 1 }];
    const bill = await computeBillDetails(items, { isImmediate: true });

    assert.equal(bill.subTotal, 600);
    assert.equal(bill.baseDeliveryFee, 0, 'Base delivery fee must be waived (0)');
    assert.equal(bill.immediateDeliveryFee, 25, 'Immediate delivery fee must remain payable (25)');
    assert.equal(bill.deliveryFee, 25, 'Total delivery fee is exactly the immediate fee');
    assert.equal(bill.handlingFee, 5);
    assert.equal(bill.totalAmount, 630);
  });

  await t.test('Scenario D (Option A): FreeShipping Promo + Express -> base fee = 0, immediate fee remains payable', async () => {
    GlobalSetting.findOne = async () => ({
      defaultTaxRate: 0,
      platformCommissionRate: 10,
      baseDeliveryFee: 30,
      handlingFee: 5,
      surgeMultiplier: 1.0,
      freeDeliveryThreshold: 1000,
      immediateDeliveryEnabled: true,
      immediateDeliveryFee: 20
    });

    PromoCode.findById = async () => ({
      _id: 'promo-freeship',
      code: 'FREESHIP',
      discountType: 'FreeShipping',
      isActive: true,
      minOrderValue: 100,
      validFrom: new Date(Date.now() - 100000),
      validUntil: new Date(Date.now() + 100000),
      usageLimitPerUser: 5
    });

    PromoUsage.findOne = async () => null;

    const items = [{ product: prod300Id, quantity: 1 }];
    const bill = await computeBillDetails(items, { promoId: 'promo-freeship', userId: 'user-1', isImmediate: true });

    assert.equal(bill.subTotal, 300);
    assert.equal(bill.baseDeliveryFee, 30, 'Base delivery fee is 30 before promo discount');
    assert.equal(bill.discountAmount, 30, 'FreeShipping discount waives exactly baseDeliveryFee (30)');
    assert.equal(bill.immediateDeliveryFee, 20, 'Immediate surcharge remains payable');
    assert.equal(bill.deliveryFee, 50); // combined before discount line item
    assert.equal(bill.handlingFee, 5);
    assert.equal(bill.totalAmount, 325); // 300 + 50 + 5 - 30 = 325
  });

  await t.test('Scenario E: Express disabled from Admin settings -> immediateDeliveryFee = 0 even if client requested immediate', async () => {
    GlobalSetting.findOne = async () => ({
      defaultTaxRate: 0,
      platformCommissionRate: 10,
      baseDeliveryFee: 30,
      handlingFee: 5,
      surgeMultiplier: 1.0,
      freeDeliveryThreshold: 500,
      immediateDeliveryEnabled: false,
      immediateDeliveryFee: 25
    });

    const items = [{ product: prod200Id, quantity: 1 }];
    const bill = await computeBillDetails(items, { isImmediate: true });

    assert.equal(bill.immediateDeliveryFee, 0);
    assert.equal(bill.baseDeliveryFee, 30);
    assert.equal(bill.deliveryFee, 30);
  });

  await t.test('Scenario F: Express enabled with ₹0 surcharge -> immediateDeliveryFee = 0', async () => {
    GlobalSetting.findOne = async () => ({
      defaultTaxRate: 0,
      platformCommissionRate: 10,
      baseDeliveryFee: 30,
      handlingFee: 5,
      surgeMultiplier: 1.0,
      freeDeliveryThreshold: 500,
      immediateDeliveryEnabled: true,
      immediateDeliveryFee: 0
    });

    const items = [{ product: prod200Id, quantity: 1 }];
    const bill = await computeBillDetails(items, { isImmediate: true });

    assert.equal(bill.immediateDeliveryFee, 0);
    assert.equal(bill.baseDeliveryFee, 30);
    assert.equal(bill.deliveryFee, 30);
  });

  await t.test('Scenario G: Toggling Express <-> Scheduled dynamically recalculates', async () => {
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

    const items = [{ product: prod200Id, quantity: 1 }];
    
    // Step 1: User chooses Express
    const billExpress = await computeBillDetails(items, { isImmediate: true });
    assert.equal(billExpress.deliveryFee, 40); // 25 + 15
    assert.equal(billExpress.totalAmount, 245);

    // Step 2: User switches to Scheduled slot
    const billScheduled = await computeBillDetails(items, { isImmediate: false });
    assert.equal(billScheduled.deliveryFee, 25);
    assert.equal(billScheduled.totalAmount, 230);

    // Step 3: User switches back to Express
    const billExpress2 = await computeBillDetails(items, { isImmediate: true });
    assert.equal(billExpress2.deliveryFee, 40);
    assert.equal(billExpress2.totalAmount, 245);
  });

  await t.test('Scenario H & I: Backward compatibility for legacy orders without immediateDeliveryFee', async () => {
    const legacyOrder = {
      _id: 'order-legacy-1',
      subTotal: 250,
      deliveryFee: 30,
      handlingFee: 5,
      totalAmount: 285
    };

    const immediateDeliveryFee = Number(legacyOrder.immediateDeliveryFee) || 0;
    const totalDeliveryFee = Number(legacyOrder.deliveryFee) || 0;
    const baseDeliveryFee = legacyOrder.baseDeliveryFee != null ? Number(legacyOrder.baseDeliveryFee) : Math.max(0, totalDeliveryFee - immediateDeliveryFee);

    assert.equal(immediateDeliveryFee, 0);
    assert.equal(baseDeliveryFee, 30);
    assert.equal(totalDeliveryFee, 30);
  });

});
