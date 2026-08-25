import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import { bulkReorderProducts } from '../src/controllers/productController.js';

const originalProductFind = Product.find;
const originalProductBulkWrite = Product.bulkWrite;

test.afterEach(() => {
  Product.find = originalProductFind;
  Product.bulkWrite = originalProductBulkWrite;
});

// Mock helper to create mock Express req & res
const createMockReqRes = ({ body = {}, admin = { role: 'Admin' }, vendor = null } = {}) => {
  const req = { body, admin, vendor };
  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    }
  };
  return { req, res };
};

const id1 = new mongoose.Types.ObjectId().toString();
const id2 = new mongoose.Types.ObjectId().toString();
const id3 = new mongoose.Types.ObjectId().toString();
const branchA = new mongoose.Types.ObjectId().toString();
const vendorX = new mongoose.Types.ObjectId().toString();

test('ACTUAL PRODUCTION bulkReorderProducts: Rejects empty or invalid items array', async () => {
  const { req, res } = createMockReqRes({ body: { items: [] } });
  await bulkReorderProducts(req, res);
  assert.equal(res.statusCode, 400);
});

test('ACTUAL PRODUCTION bulkReorderProducts: Rejects invalid MongoDB ObjectId', async () => {
  const { req, res } = createMockReqRes({
    body: { items: [{ id: 'not-an-id', displayOrder: 1 }] }
  });
  await bulkReorderProducts(req, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.data.message, /invalid product ID/i);
});

test('ACTUAL PRODUCTION bulkReorderProducts: Rejects negative displayOrder', async () => {
  const { req, res } = createMockReqRes({
    body: { items: [{ id: id1, displayOrder: -1 }] }
  });
  await bulkReorderProducts(req, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.data.message, /must be a non-negative number/i);
});

test('ACTUAL PRODUCTION bulkReorderProducts: Rejects duplicate displayOrder in same request', async () => {
  const { req, res } = createMockReqRes({
    body: {
      items: [
        { id: id1, displayOrder: 1 },
        { id: id2, displayOrder: 1 }
      ]
    }
  });
  await bulkReorderProducts(req, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.data.message, /Duplicate displayOrder position/i);
});

test('ACTUAL PRODUCTION bulkReorderProducts: Atomic rejection if any item does not exist in DB', async () => {
  // Mock Product.find to return only id1 (id2 is missing)
  Product.find = function(filter) {
    return {
      select() {
        return {
          lean() {
            return Promise.resolve([{ _id: id1 }]);
          }
        };
      }
    };
  };

  let bulkWriteCalled = false;
  Product.bulkWrite = function() {
    bulkWriteCalled = true;
    return Promise.resolve({ matchedCount: 1, modifiedCount: 1 });
  };

  const { req, res } = createMockReqRes({
    body: {
      items: [
        { id: id1, displayOrder: 1 },
        { id: id2, displayOrder: 2 } // id2 does not exist
      ]
    }
  });

  await bulkReorderProducts(req, res);
  assert.equal(res.statusCode, 404);
  assert.equal(bulkWriteCalled, false); // ZERO writes executed - Atomic guarantee!
  assert.deepEqual(res.data.missingIds, [id2]);
});

test('ACTUAL PRODUCTION bulkReorderProducts: Store Manager cannot modify product outside authorized branch', async () => {
  let capturedFilter = null;
  Product.find = function(filter) {
    capturedFilter = filter;
    // Simulated branch filter: returns only matching branch items (none for other branch)
    return {
      select() {
        return {
          lean() {
            return Promise.resolve([]); // not found under branchA
          }
        };
      }
    };
  };

  let bulkWriteCalled = false;
  Product.bulkWrite = function() {
    bulkWriteCalled = true;
    return Promise.resolve({ matchedCount: 0, modifiedCount: 0 });
  };

  const { req, res } = createMockReqRes({
    body: { items: [{ id: id1, displayOrder: 1 }] },
    admin: { role: 'Store Manager', branchId: branchA }
  });

  await bulkReorderProducts(req, res);
  assert.equal(res.statusCode, 404);
  assert.equal(bulkWriteCalled, false);
  assert.equal(capturedFilter['branchStocks.branchId'], branchA);
});

test('ACTUAL PRODUCTION bulkReorderProducts: Successfully executes atomic bulkWrite for valid batch', async () => {
  Product.find = function(filter) {
    return {
      select() {
        return {
          lean() {
            return Promise.resolve([{ _id: id1 }, { _id: id2 }]);
          }
        };
      }
    };
  };

  let capturedOps = [];
  Product.bulkWrite = function(ops) {
    capturedOps = ops;
    return Promise.resolve({ matchedCount: 2, modifiedCount: 2 });
  };

  const { req, res } = createMockReqRes({
    body: {
      items: [
        { id: id1, displayOrder: 1 },
        { id: id2, displayOrder: null } // clearing position
      ]
    }
  });

  await bulkReorderProducts(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.data.success, true);
  assert.equal(capturedOps.length, 2);
  assert.deepEqual(capturedOps[0].updateOne.update, { $set: { displayOrder: 1 } });
  assert.deepEqual(capturedOps[1].updateOne.update, { $set: { displayOrder: null } });
});
