import assert from 'node:assert/strict';
import test from 'node:test';
import Product from '../src/models/Product.js';
import GlobalSetting from '../src/models/GlobalSetting.js';
import Order from '../src/models/Order.js';

test('Database Schema: Product model has displayOrder field and required compound indexes', () => {
  const displayOrderPath = Product.schema.path('displayOrder');
  assert.ok(displayOrderPath, 'Product schema must have displayOrder field');
  assert.equal(displayOrderPath.instance, 'Number');
  assert.equal(displayOrderPath.defaultValue, null);

  const indexes = Product.schema.indexes();
  
  // Verify category compound index with displayOrder
  const categoryIndex = indexes.find(([fields]) => 
    fields.category === 1 && 
    fields.status === 1 && 
    fields.displayOrder === 1 && 
    fields.isSaathigro === -1 && 
    fields.createdAt === -1
  );
  assert.ok(categoryIndex, 'Product schema must have compound index for category + displayOrder');

  // Verify status compound index with displayOrder
  const statusIndex = indexes.find(([fields]) => 
    fields.status === 1 && 
    fields.displayOrder === 1 && 
    fields.isSaathigro === -1 && 
    fields.createdAt === -1
  );
  assert.ok(statusIndex, 'Product schema must have compound index for status + displayOrder');
});

test('Database Schema: GlobalSetting model has immediateDeliveryFee field with min=0', () => {
  const feePath = GlobalSetting.schema.path('immediateDeliveryFee');
  assert.ok(feePath, 'GlobalSetting schema must have immediateDeliveryFee field');
  assert.equal(feePath.instance, 'Number');
  assert.equal(feePath.defaultValue, 0);

  const testSetting = new GlobalSetting({ immediateDeliveryFee: 15 });
  assert.equal(testSetting.immediateDeliveryFee, 15);

  const invalidSetting = new GlobalSetting({ immediateDeliveryFee: -10 });
  const validationError = invalidSetting.validateSync();
  assert.ok(validationError?.errors?.immediateDeliveryFee, 'Negative immediateDeliveryFee must fail Mongoose validation');
});

test('Database Schema: Order model has immediateDeliveryFee field defaulting to 0', () => {
  const feePath = Order.schema.path('immediateDeliveryFee');
  assert.ok(feePath, 'Order schema must have immediateDeliveryFee field');
  assert.equal(feePath.instance, 'Number');
  assert.equal(feePath.defaultValue, 0);

  const testOrder = new Order();
  assert.equal(testOrder.immediateDeliveryFee, 0);
});
