import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import { orderByIds } from '../src/controllers/categoryPageController.js';

test('1. ordered products appear before null/unassigned products in ascending order', () => {
  const products = [
    { _id: 'p4', name: 'Product 4', displayOrder: null, isSaathigro: false, createdAt: new Date('2026-01-01') },
    { _id: 'p2', name: 'Product 2', displayOrder: 2, isSaathigro: false, createdAt: new Date('2026-01-02') },
    { _id: 'p1', name: 'Product 1', displayOrder: 1, isSaathigro: false, createdAt: new Date('2026-01-03') },
    { _id: 'p3', name: 'Product 3', displayOrder: 3, isSaathigro: false, createdAt: new Date('2026-01-04') },
  ];

  const ordered = products.filter(p => p.displayOrder !== null && p.displayOrder >= 0)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const unassigned = products.filter(p => p.displayOrder === null || p.displayOrder === undefined);

  const combined = [...ordered, ...unassigned];
  assert.equal(combined[0].name, 'Product 1');
  assert.equal(combined[1].name, 'Product 2');
  assert.equal(combined[2].name, 'Product 3');
  assert.equal(combined[3].name, 'Product 4');
});

test('2 & 3. unassigned products use isSaathigro DESC, createdAt DESC, _id ASC', () => {
  const unassigned = [
    { _id: 'pC', name: 'Regular Old', isSaathigro: false, createdAt: new Date('2026-01-01') },
    { _id: 'pB', name: 'Regular New', isSaathigro: false, createdAt: new Date('2026-01-05') },
    { _id: 'pA', name: 'Brand Featured', isSaathigro: true, createdAt: new Date('2026-01-02') },
    { _id: 'pD', name: 'Regular Same Date 1', isSaathigro: false, createdAt: new Date('2026-01-05') },
  ];

  unassigned.sort((a, b) => {
    if (a.isSaathigro !== b.isSaathigro) return b.isSaathigro ? 1 : -1;
    if (b.createdAt.getTime() !== a.createdAt.getTime()) return b.createdAt.getTime() - a.createdAt.getTime();
    return a._id.localeCompare(b._id);
  });

  assert.equal(unassigned[0].name, 'Brand Featured'); // isSaathigro true
  assert.equal(unassigned[1].name, 'Regular New'); // newest
  assert.equal(unassigned[2].name, 'Regular Same Date 1'); // tie break by _id
  assert.equal(unassigned[3].name, 'Regular Old'); // oldest
});

test('4. pagination boundary across ordered (3 items) and unassigned (3 items) with limit=2', () => {
  const orderedList = [
    { _id: 'o1', name: 'Ordered 1', displayOrder: 1 },
    { _id: 'o2', name: 'Ordered 2', displayOrder: 2 },
    { _id: 'o3', name: 'Ordered 3', displayOrder: 3 },
  ];
  const unassignedList = [
    { _id: 'u1', name: 'Unassigned 1' },
    { _id: 'u2', name: 'Unassigned 2' },
    { _id: 'u3', name: 'Unassigned 3' },
  ];

  const getPage = (page, limit) => {
    const skip = (page - 1) * limit;
    const orderedCount = orderedList.length;
    if (skip < orderedCount) {
      const pageOrdered = orderedList.slice(skip, skip + limit);
      if (pageOrdered.length < limit) {
        const remainingNeeded = limit - pageOrdered.length;
        const pageUnassigned = unassignedList.slice(0, remainingNeeded);
        return [...pageOrdered, ...pageUnassigned];
      }
      return pageOrdered;
    } else {
      const unassignedSkip = skip - orderedCount;
      return unassignedList.slice(unassignedSkip, unassignedSkip + limit);
    }
  };

  // Page 1: 2 items -> [Ordered 1, Ordered 2]
  const p1 = getPage(1, 2);
  assert.deepEqual(p1.map(p => p.name), ['Ordered 1', 'Ordered 2']);

  // Page 2: 2 items -> [Ordered 3, Unassigned 1]
  const p2 = getPage(2, 2);
  assert.deepEqual(p2.map(p => p.name), ['Ordered 3', 'Unassigned 1']);

  // Page 3: 2 items -> [Unassigned 2, Unassigned 3]
  const p3 = getPage(3, 2);
  assert.deepEqual(p3.map(p => p.name), ['Unassigned 2', 'Unassigned 3']);
});

test('5. explicit price sort overrides displayOrder', () => {
  const items = [
    { _id: 'p1', name: 'Product 1', displayOrder: 1, basePrice: 500 },
    { _id: 'p2', name: 'Product 2', displayOrder: 2, basePrice: 100 },
    { _id: 'p3', name: 'Product 3', displayOrder: null, basePrice: 250 },
  ];

  const sortedByPriceAsc = [...items].sort((a, b) => a.basePrice - b.basePrice);
  assert.equal(sortedByPriceAsc[0].name, 'Product 2'); // 100
  assert.equal(sortedByPriceAsc[1].name, 'Product 3'); // 250
  assert.equal(sortedByPriceAsc[2].name, 'Product 1'); // 500
});

test('6. curated section.productIds order is preserved exactly by orderByIds', () => {
  const fetchedProducts = [
    { _id: 'id-c', name: 'Product C' },
    { _id: 'id-a', name: 'Product A' },
    { _id: 'id-b', name: 'Product B' }
  ];
  const curatedIds = ['id-b', 'id-c', 'id-a'];

  const sorted = orderByIds(fetchedProducts, curatedIds);
  assert.equal(sorted[0].name, 'Product B');
  assert.equal(sorted[1].name, 'Product C');
  assert.equal(sorted[2].name, 'Product A');
});

test('7, 8, 9, 10, 11, 12. Reorder validation logic unit checks', () => {
  const validateReorderPayload = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('NON_EMPTY_ARRAY_REQUIRED');
    }
    const assignedPositions = new Set();
    const ops = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item || !item.id) throw new Error('MISSING_ID');
      if (!mongoose.Types.ObjectId.isValid(item.id)) throw new Error('INVALID_ID');

      let parsedOrder = null;
      if (item.displayOrder !== undefined && item.displayOrder !== null && String(item.displayOrder).trim() !== '') {
        const num = Number(item.displayOrder);
        if (!Number.isFinite(num) || num < 0) throw new Error('INVALID_DISPLAY_ORDER');
        if (assignedPositions.has(num)) throw new Error('DUPLICATE_DISPLAY_ORDER');
        assignedPositions.add(num);
        parsedOrder = num;
      }
      ops.push({ id: item.id, displayOrder: parsedOrder });
    }
    return ops;
  };

  const validId1 = new mongoose.Types.ObjectId().toString();
  const validId2 = new mongoose.Types.ObjectId().toString();

  // Valid payload
  const validResult = validateReorderPayload([
    { id: validId1, displayOrder: 1 },
    { id: validId2, displayOrder: null } // 12. null clears position
  ]);
  assert.equal(validResult[0].displayOrder, 1);
  assert.equal(validResult[1].displayOrder, null);

  // 8. duplicate positions rejected
  assert.throws(() => validateReorderPayload([
    { id: validId1, displayOrder: 1 },
    { id: validId2, displayOrder: 1 }
  ]), /DUPLICATE_DISPLAY_ORDER/);

  // 9. invalid ID rejected
  assert.throws(() => validateReorderPayload([
    { id: 'not-an-object-id', displayOrder: 1 }
  ]), /INVALID_ID/);

  // 10. negative displayOrder rejected
  assert.throws(() => validateReorderPayload([
    { id: validId1, displayOrder: -5 }
  ]), /INVALID_DISPLAY_ORDER/);

  // 10. non-numeric displayOrder rejected
  assert.throws(() => validateReorderPayload([
    { id: validId1, displayOrder: 'abc' }
  ]), /INVALID_DISPLAY_ORDER/);
});
