import assert from 'node:assert/strict';
import test from 'node:test';
import http from 'node:http';
import express from 'express';
import jwt from 'jsonwebtoken';
import productRoutes from '../src/routes/productRoutes.js';
import settingRoutes from '../src/routes/settingRoutes.js';
import Admin from '../src/models/Admin.js';
import Product from '../src/models/Product.js';

// Setup Express app and live HTTP server
const app = express();
app.use(express.json());
app.use('/api/admin/products', productRoutes);
app.use('/api/settings', settingRoutes);

const originalAdminFindById = Admin.findById;
let server;
let baseUrl;

const JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
process.env.JWT_SECRET = JWT_SECRET;

test.before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(() => {
  Admin.findById = originalAdminFindById;
  if (server) server.close();
});

test('HTTP API: PUT /api/admin/products/reorder without auth header returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/admin/products/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [] })
  });

  assert.equal(res.status, 401);
  const data = await res.json();
  assert.match(data.message, /authentication required/i);
});

test('HTTP API: PUT /api/admin/products/reorder for role lacking MANAGE_PRODUCTS returns 403', async () => {
  const staffId = '67bca0000000000000000001';
  const token = jwt.sign({ id: staffId }, JWT_SECRET);

  Admin.findById = function(id) {
    return Promise.resolve({
      _id: staffId,
      role: 'Staff',
      permissions: ['VIEW_DASHBOARD'],
      isActive: true
    });
  };

  const res = await fetch(`${baseUrl}/api/admin/products/reorder`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ items: [] })
  });

  assert.equal(res.status, 403);
  const data = await res.json();
  assert.match(data.message, /permission/i);
});

test('HTTP API: PUT /api/admin/products/reorder with Admin auth and invalid payload returns 400', async () => {
  const adminId = '67bca0000000000000000002';
  const token = jwt.sign({ id: adminId }, JWT_SECRET);

  Admin.findById = function(id) {
    return Promise.resolve({
      _id: adminId,
      role: 'Admin',
      permissions: [],
      isActive: true
    });
  };

  const res = await fetch(`${baseUrl}/api/admin/products/reorder`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ items: [] })
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.match(data.message, /items array/i);
});

test('HTTP API: PUT /api/admin/products/reorder is NOT captured by /:id updateProduct route', async () => {
  const routes = productRoutes.stack.filter(r => r.route).map(r => ({
    path: r.route.path,
    methods: Object.keys(r.route.methods)
  }));

  const reorderIndex = routes.findIndex(r => r.path === '/reorder' && r.methods.includes('put'));
  const idIndex = routes.findIndex(r => r.path === '/:id' && r.methods.includes('put'));

  assert.ok(reorderIndex !== -1, '/reorder PUT route must exist');
  assert.ok(idIndex !== -1, '/:id PUT route must exist');
  assert.ok(reorderIndex < idIndex, '/reorder must be mounted BEFORE /:id in Express router stack');
});
