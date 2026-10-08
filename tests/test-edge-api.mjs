/**
 * ============================================================================
 * Edge Pages Functions API & D1/R2 Verification Test
 * ============================================================================
 * Tests functions/api/_api.js handlers with simulated D1 database and R2 bucket.
 * ============================================================================
 */

import { handleApiRequest } from '../functions/api/_api.js';

// In-memory Mock D1 Database
class MockD1 {
  constructor() {
    this.tables = {
      users: new Map(),
      products: new Map(),
      orders: new Map()
    };
  }

  prepare(sql) {
    const db = this;
    const stmt = {
      bind(...params) {
        return {
          async run() {
            return db.executeWrite(sql, params);
          },
          async first() {
            const rows = db.executeQuery(sql, params);
            return rows.length > 0 ? rows[0] : null;
          },
          async all() {
            const rows = db.executeQuery(sql, params);
            return { results: rows };
          }
        };
      },
      async run() {
        return db.executeWrite(sql, []);
      },
      async first() {
        const rows = db.executeQuery(sql, []);
        return rows.length > 0 ? rows[0] : null;
      },
      async all() {
        const rows = db.executeQuery(sql, []);
        return { results: rows };
      }
    };
    return stmt;
  }

  async batch(statements) {
    const results = [];
    for (const stmt of statements) {
      results.push(await stmt.run());
    }
    return results;
  }

  executeWrite(sql, params) {
    const cleanSql = sql.trim();
    if (cleanSql.includes('INSERT INTO users') || cleanSql.includes('INSERT OR IGNORE INTO users')) {
      const [id, registered_at, name, email, phone, password, status] = params;
      this.tables.users.set(id, { id, registered_at, name, email, phone, password, status });
      return { meta: { changes: 1 } };
    }

    if (cleanSql.includes('INSERT INTO products') || cleanSql.includes('INSERT OR REPLACE INTO products')) {
      const [id, created_at, title, brand, category, price, old_price, condition, storage, ram, battery, display, chip, camera, color, warranty, stock, description, status, images, rating, reviews, views, tags] = params;
      this.tables.products.set(id, { id, created_at, title, brand, category, price, old_price, condition, storage, ram, battery, display, chip, camera, color, warranty, stock, description, status, images, rating, reviews, views, tags });
      return { meta: { changes: 1 } };
    }

    if (cleanSql.includes('DELETE FROM products WHERE id = ?')) {
      const [id] = params;
      this.tables.products.delete(id);
      return { meta: { changes: 1 } };
    }

    if (cleanSql.includes('INSERT INTO orders')) {
      const [ref, placed_at, customer_name, customer_email, customer_phone, address, area, city, payment_method, items_count, total_amount, items_details, order_status] = params;
      this.tables.orders.set(ref, { ref, placed_at, customer_name, customer_email, customer_phone, address, area, city, payment_method, items_count, total_amount, items_details, order_status });
      return { meta: { changes: 1 } };
    }

    if (cleanSql.includes('UPDATE orders SET order_status = ? WHERE upper(ref) = upper(?)')) {
      const [status, ref] = params;
      for (const [k, v] of this.tables.orders.entries()) {
        if (k.toUpperCase() === ref.toUpperCase()) {
          v.order_status = status;
          return { meta: { changes: 1 } };
        }
      }
    }

    if (cleanSql.includes('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?')) {
      const [qty, id] = params;
      const p = this.tables.products.get(id);
      if (p) p.stock = Math.max(0, (p.stock || 0) - qty);
      return { meta: { changes: 1 } };
    }

    if (cleanSql.includes('UPDATE users\n      SET status = ?')) {
      const [status, email, id, altId] = params;
      for (const u of this.tables.users.values()) {
        if (u.email.toLowerCase() === email || u.id === id || u.id === altId) {
          u.status = status;
          return { meta: { changes: 1 } };
        }
      }
    }

    return { meta: { changes: 0 } };
  }

  executeQuery(sql, params) {
    if (sql.includes('SELECT * FROM products')) {
      return Array.from(this.tables.products.values());
    }
    if (sql.includes('SELECT * FROM orders')) {
      return Array.from(this.tables.orders.values());
    }
    if (sql.includes('SELECT id, registered_at, name, email, phone, status\n      FROM users')) {
      return Array.from(this.tables.users.values());
    }
    if (sql.includes('SELECT id FROM users WHERE lower(email) = ?')) {
      const [email] = params;
      for (const u of this.tables.users.values()) {
        if (u.email.toLowerCase() === email.toLowerCase()) return [{ id: u.id }];
      }
      return [];
    }
    if (sql.includes('SELECT id, registered_at, name, email, phone, password, status\n      FROM users\n      WHERE lower(email) = ?')) {
      const [email] = params;
      for (const u of this.tables.users.values()) {
        if (u.email.toLowerCase() === email.toLowerCase()) return [u];
      }
      return [];
    }
    return [];
  }
}

// In-memory Mock R2 Bucket
class MockR2 {
  constructor() {
    this.storage = new Map();
  }

  async put(key, body, options = {}) {
    this.storage.set(key, {
      body,
      httpMetadata: options.httpMetadata || {},
      httpEtag: '"mock-etag-' + Date.now() + '"'
    });
    return { key };
  }

  async get(key) {
    const item = this.storage.get(key);
    if (!item) return null;
    return {
      body: item.body,
      httpMetadata: item.httpMetadata,
      httpEtag: item.httpEtag,
      writeHttpMetadata(headers) {
        if (item.httpMetadata.contentType) {
          headers.set('Content-Type', item.httpMetadata.contentType);
        }
        if (item.httpMetadata.cacheControl) {
          headers.set('Cache-Control', item.httpMetadata.cacheControl);
        }
      }
    };
  }
}

const db = new MockD1();
const mockR2 = new MockR2();
const env = { DB: db, PHOTOS_BUCKET: mockR2 };

async function runTests() {
  console.log('--- TESTING EDGE PAGES FUNCTIONS (D1 & R2) API ---');
  let pass = 0, fail = 0;

  function assert(cond, msg) {
    if (cond) {
      console.log(`  [PASS] ${msg}`);
      pass++;
    } else {
      console.error(`  [FAIL] ${msg}`);
      fail++;
    }
  }

  // 1. Health check
  const pingRes = await handleApiRequest(new Request('http://localhost/api/ping', { method: 'GET' }), env);
  const pingData = await pingRes.json();
  assert(pingData.ok === true && pingData.databaseConnected === true, 'GET /api/ping returns live status');

  // 2. User Registration & Login in D1
  const regRes = await handleApiRequest(new Request('http://localhost/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email: 'test@example.com', password: 'password123', phone: '01711111111' })
  }), env);
  const regData = await regRes.json();
  assert(regData.ok === true && regData.user.email === 'test@example.com', 'POST /api/users/register creates user in D1');

  // 3. User Login
  const loginRes = await handleApiRequest(new Request('http://localhost/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
  }), env);
  const loginData = await loginRes.json();
  assert(loginData.ok === true && loginData.user.name === 'Test User', 'POST /api/users/login verifies user in D1');

  // 4. Products: Add & Get in D1
  const addProdRes = await handleApiRequest(new Request('http://localhost/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 'prod-test-1',
      title: 'Edge Phone 1',
      price: 50000,
      stock: 10,
      category: 'phone',
      brand: 'Edge',
      images: ['/api/images/products/sample.webp']
    })
  }), env);
  const addProdData = await addProdRes.json();
  assert(addProdData.ok === true && addProdData.product.title === 'Edge Phone 1', 'POST /api/products inserts product into D1');

  const getProdsRes = await handleApiRequest(new Request('http://localhost/api/products', { method: 'GET' }), env);
  const getProdsData = await getProdsRes.json();
  assert(getProdsData.ok === true && getProdsData.products.length === 1, 'GET /api/products fetches products from D1');

  // 5. Orders: Place order & decrement stock in D1
  const orderRes = await handleApiRequest(new Request('http://localhost/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ref: 'MG-TEST-99',
      name: 'Buyer',
      email: 'buyer@example.com',
      phone: '01800000000',
      address: 'Dhaka',
      total: 50000,
      items: [{ id: 'prod-test-1', qty: 2 }]
    })
  }), env);
  const orderData = await orderRes.json();
  assert(orderData.ok === true && orderData.ref === 'MG-TEST-99', 'POST /api/orders saves order to D1');

  const checkProd = db.tables.products.get('prod-test-1');
  assert(checkProd && checkProd.stock === 8, 'D1 auto-decrements stock on order (10 - 2 = 8)');

  // 6. R2 Photo Upload & Serve
  const uploadRes = await handleApiRequest(new Request('http://localhost/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==',
      filename: 'sample.webp'
    })
  }), env);
  const uploadData = await uploadRes.json();
  assert(uploadData.ok === true && uploadData.url.startsWith('/api/images/'), 'POST /api/upload stores photo in R2 and returns URL');

  const serveRes = await handleApiRequest(new Request(`http://localhost${uploadData.url}`, { method: 'GET' }), env);
  assert(serveRes.status === 200 && serveRes.headers.get('Content-Type') === 'image/webp', 'GET /api/images/:key serves photo from R2 with caching');

  // 7. Backward-compatible Action Dispatcher
  const actionRes = await handleApiRequest(new Request('http://localhost/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get_products' })
  }), env);
  const actionData = await actionRes.json();
  assert(actionData.ok === true && Array.isArray(actionData.products), 'POST /api with action=get_products works seamlessly');

  console.log(`\nResults: ${pass} Passed, ${fail} Failed`);
  if (fail > 0) process.exit(1);
}

runTests();
