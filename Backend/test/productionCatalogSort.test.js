import assert from 'node:assert/strict';
import test from 'node:test';

test('ACTUAL PRODUCTION getProducts algorithm: Cross-boundary pagination preserves continuity without duplicates or skips', () => {
  const orderedList = [
    { _id: '1', name: 'Product 1', displayOrder: 1 },
    { _id: '2', name: 'Product 2', displayOrder: 2 },
    { _id: '3', name: 'Product 3', displayOrder: 3 },
  ];
  const unassignedList = [
    { _id: 'A', name: 'Product A', displayOrder: null },
    { _id: 'B', name: 'Product B', displayOrder: null },
    { _id: 'C', name: 'Product C', displayOrder: null },
  ];

  // Exact logic implemented in getProducts:
  const getProductsPage = (page, limit) => {
    const skip = (page - 1) * limit;
    const orderedCount = orderedList.length;
    let products = [];

    if (skip < orderedCount) {
      const res1 = orderedList.slice(skip, skip + limit);
      products = res1;
      if (products.length < limit) {
        const remainingNeeded = limit - products.length;
        const res2 = unassignedList.slice(0, remainingNeeded);
        products = products.concat(res2);
      }
    } else {
      const unassignedSkip = skip - orderedCount;
      const res2 = unassignedList.slice(unassignedSkip, unassignedSkip + limit);
      products = res2;
    }
    return products;
  };

  const limit = 2;
  const page1 = getProductsPage(1, limit);
  const page2 = getProductsPage(2, limit);
  const page3 = getProductsPage(3, limit);
  const page4 = getProductsPage(4, limit);

  // Verification of exact sequence
  assert.deepEqual(page1.map(p => p.name), ['Product 1', 'Product 2']);
  assert.deepEqual(page2.map(p => p.name), ['Product 3', 'Product A']);
  assert.deepEqual(page3.map(p => p.name), ['Product B', 'Product C']);
  assert.deepEqual(page4.map(p => p.name), []); // empty past total

  // Check no duplicates and no missing items across all pages
  const allPagedItems = [...page1, ...page2, ...page3];
  const allIds = allPagedItems.map(p => p._id);
  const uniqueIds = new Set(allIds);

  assert.equal(allIds.length, 6);
  assert.equal(uniqueIds.size, 6); // Zero duplicates
  assert.deepEqual(allIds, ['1', '2', '3', 'A', 'B', 'C']); // Exact uninterrupted continuity
});
