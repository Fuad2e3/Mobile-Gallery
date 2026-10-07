/**
 * ============================================================================
 * Mobile Gallery — Cloudflare Worker & Pages API Router
 * ============================================================================
 * Fullstack API handler connecting:
 *   - Database: Cloudflare D1 (Tables: users, products, orders)
 *   - Optimized Photo Storage: Cloudflare R2 (Bucket: PHOTOS_BUCKET)
 *   - Edge REST & Action-compatible Dispatcher
 * ============================================================================
 */

// Helper to construct JSON responses with CORS headers
export function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      ...extraHeaders
    }
  });
}

// CORS Pre-flight Options Handler
export function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400'
    }
  });
}

/**
 * Main API request dispatcher
 * @param {Request} request
 * @param {Object} env - Cloudflare bindings: env.DB (D1) and env.PHOTOS_BUCKET (R2)
 * @param {Object} [ctx]
 * @returns {Promise<Response>}
 */
export async function handleApiRequest(request, env, ctx) {
  if (request.method === 'OPTIONS') {
    return handleOptions();
  }

  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  const method = request.method.toUpperCase();

  // 1. Health check & status
  if (pathname === '/api' || pathname === '/api/ping' || pathname === '/api/health') {
    if (method === 'GET') {
      return jsonResponse({
        ok: true,
        message: 'Mobile Gallery Cloudflare Edge API is live and operational.',
        databaseConnected: !!env.DB,
        r2StorageConnected: !!env.PHOTOS_BUCKET,
        timestamp: new Date().toISOString()
      });
    }
  }

  // 2. Photo Storage in R2: Serve photo
  if (pathname.startsWith('/api/images/')) {
    const key = pathname.replace('/api/images/', '');
    return handleServePhoto(key, env);
  }

  // 3. Photo Upload to R2
  if (pathname === '/api/upload' && method === 'POST') {
    return handleUploadPhoto(request, env);
  }

  // Parse Body for POST / PUT / PATCH
  let body = {};
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    try {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json') || contentType.includes('text/plain')) {
        const text = await request.text();
        if (text && text.trim().length > 0) {
          body = JSON.parse(text);
        }
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const form = await request.formData();
        for (const [k, v] of form.entries()) body[k] = v;
      }
    } catch (err) {
      return jsonResponse({ ok: false, error: 'Invalid JSON payload: ' + err.message }, 400);
    }
  }

  // Action-based RPC compatibility dispatcher (for POST /api or POST /api/dispatch)
  if ((pathname === '/api' || pathname === '/api/dispatch') && method === 'POST') {
    const action = body.action || url.searchParams.get('action');
    if (action) {
      return dispatchAction(action, body, env, url);
    }
  }

  // Action-based GET compatibility: /api?action=...
  if ((pathname === '/api' || pathname === '/api/dispatch') && method === 'GET') {
    const action = url.searchParams.get('action') || 'ping';
    return dispatchAction(action, {}, env, url);
  }

  // REST Routes:
  // --- Products ---
  if (pathname === '/api/products') {
    if (method === 'GET') return getProducts(env);
    if (method === 'POST') return addOrUpdateProduct(body, env);
  }

  if (pathname.startsWith('/api/products/')) {
    const id = pathname.replace('/api/products/', '');
    if (id === 'seed' && method === 'POST') return seedProducts(body.products || [], env);
    if (method === 'PUT' || method === 'POST') return addOrUpdateProduct({ ...body, id }, env);
    if (method === 'DELETE') return deleteProduct(id, env);
  }

  // --- Orders ---
  if (pathname === '/api/orders') {
    if (method === 'GET') return getOrders(env);
    if (method === 'POST') return placeOrder(body, env);
  }

  if (pathname === '/api/orders/status' && (method === 'POST' || method === 'PUT')) {
    return updateOrderStatus(body.ref, body.status, env);
  }

  if (pathname.startsWith('/api/orders/')) {
    const ref = pathname.replace('/api/orders/', '');
    if (method === 'PATCH' || method === 'PUT') return updateOrderStatus(ref, body.status, env);
  }

  // --- Users & Access ---
  if (pathname === '/api/users') {
    if (method === 'GET') return getUsers(env);
  }

  if (pathname === '/api/users/register' && method === 'POST') {
    return registerUser(body, env);
  }

  if (pathname === '/api/users/login' && method === 'POST') {
    return loginUser(body, env);
  }

  if (pathname === '/api/users/status' && method === 'POST') {
    return updateUserStatus(body.email || body.id, body.status, body.userId || body.id, env);
  }

  return jsonResponse({ ok: false, error: 'Endpoint not found: ' + pathname }, 404);
}

/**
 * Dispatcher for action-based calls (backwards compatible with SheetEndpoint actions)
 */
async function dispatchAction(action, data, env, url) {
  switch (action) {
    case 'ping':
      return jsonResponse({
        ok: true,
        message: 'Mobile Gallery Cloudflare D1 & R2 API is active and ready.',
        databaseConnected: !!env.DB,
        r2Connected: !!env.PHOTOS_BUCKET
      });

    case 'get_products':
      return getProducts(env);

    case 'add_product':
      return addOrUpdateProduct(data, env);

    case 'update_product':
      return addOrUpdateProduct(data, env);

    case 'delete_product':
      return deleteProduct(data.id, env);

    case 'seed_products':
      return seedProducts(data.products || [], env);

    case 'place_order':
      return placeOrder(data, env);

    case 'get_orders':
      return getOrders(env);

    case 'update_order_status':
      return updateOrderStatus(data.ref, data.status, env);

    case 'register_user':
      return registerUser(data, env);

    case 'login_user':
      return loginUser(data, env);

    case 'get_users':
      return getUsers(env);

    case 'update_user_status':
      return updateUserStatus(data.email || data.id, data.status, data.userId || data.id, env);

    case 'upload_photo':
      return handleUploadPhotoDirect(data, env);

    default:
      return jsonResponse({ ok: false, error: 'Unknown action: ' + action }, 400);
  }
}

/* ============================================================================
   1. Cloudflare R2 Photo Storage Handlers (Optimized WebP / Images)
   ============================================================================ */

/**
 * Handle serving an image from Cloudflare R2
 */
async function handleServePhoto(key, env) {
  if (!env.PHOTOS_BUCKET) {
    return new Response('Cloudflare R2 Bucket (PHOTOS_BUCKET) not configured.', { status: 500 });
  }

  try {
    const object = await env.PHOTOS_BUCKET.get(key);
    if (!object) {
      return new Response('Photo not found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(object.body, { headers });
  } catch (err) {
    return new Response('Error retrieving photo: ' + err.message, { status: 500 });
  }
}

/**
 * Handle uploading an optimized photo to Cloudflare R2
 */
async function handleUploadPhoto(request, env) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json') || contentType.includes('text/plain')) {
    const body = await request.json();
    return handleUploadPhotoDirect(body, env);
  }

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const file = formData.get('file') || formData.get('photo') || formData.get('image');
    if (!file) {
      return jsonResponse({ ok: false, error: 'No image file found in form data' }, 400);
    }

    const buffer = await file.arrayBuffer();
    const mimeType = file.type || 'image/webp';
    return saveBufferToR2(buffer, mimeType, file.name, env);
  }

  return jsonResponse({ ok: false, error: 'Unsupported upload format. Use JSON dataUrl or multipart/form-data.' }, 400);
}

/**
 * Direct photo upload from JSON { image, filename }
 */
async function handleUploadPhotoDirect(data, env) {
  const rawImage = data.image || data.dataUrl || data.photo || '';
  if (!rawImage) {
    return jsonResponse({ ok: false, error: 'No image data provided.' }, 400);
  }

  // Handle data URL (data:image/webp;base64,...)
  let mimeType = 'image/webp';
  let base64Data = rawImage;

  if (rawImage.startsWith('data:')) {
    const matches = rawImage.match(/^data:([a-zA-Z0-9/+.-]+);base64,(.+)$/);
    if (matches) {
      mimeType = matches[1];
      base64Data = matches[2];
    } else {
      const commaIdx = rawImage.indexOf(',');
      if (commaIdx !== -1) {
        base64Data = rawImage.slice(commaIdx + 1);
      }
    }
  }

  // Decode Base64 to Uint8Array
  try {
    const binaryStr = atob(base64Data);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    return saveBufferToR2(bytes.buffer, mimeType, data.filename, env);
  } catch (err) {
    return jsonResponse({ ok: false, error: 'Failed to decode base64 image: ' + err.message }, 400);
  }
}

/**
 * Put raw image buffer into Cloudflare R2
 */
async function saveBufferToR2(arrayBuffer, mimeType, originalName, env) {
  if (!env.PHOTOS_BUCKET) {
    // Graceful fallback if R2 is not yet attached during setup
    return jsonResponse({
      ok: true,
      fallback: true,
      note: 'R2 bucket PHOTOS_BUCKET is not bound in wrangler.toml yet.',
      url: ''
    });
  }

  const ext = mimeType.includes('png') ? 'png' : mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg' : 'webp';
  const cleanId = Math.random().toString(36).slice(2, 8);
  const key = `products/mg_${Date.now()}_${cleanId}.${ext}`;

  try {
    await env.PHOTOS_BUCKET.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: mimeType,
        cacheControl: 'public, max-age=31536000, immutable'
      }
    });

    const publicUrl = `/api/images/${key}`;

    return jsonResponse({
      ok: true,
      key,
      url: publicUrl,
      size: arrayBuffer.byteLength,
      mimeType
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: 'R2 upload failed: ' + err.message }, 500);
  }
}

/* ============================================================================
   2. Cloudflare D1 Products Handlers
   ============================================================================ */

/**
 * Helper to ensure D1 database is available
 */
function assertDb(env) {
  if (!env.DB) {
    throw new Error('Cloudflare D1 binding (env.DB) is missing. Please configure [[d1_databases]] in wrangler.toml.');
  }
}

/**
 * Fetch all products from D1
 */
async function getProducts(env) {
  try {
    assertDb(env);
    const { results } = await env.DB.prepare('SELECT * FROM products ORDER BY rowid DESC').all();

    const formatted = (results || []).map(row => {
      let images = [];
      try {
        images = typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || []);
      } catch (_) { images = []; }

      let tags = [];
      try {
        tags = typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []);
      } catch (_) { tags = []; }

      return {
        id: row.id,
        title: row.title,
        brand: row.brand || '',
        category: row.category || 'phone',
        price: Number(row.price) || 0,
        oldPrice: Number(row.old_price) || 0,
        old_price: Number(row.old_price) || 0,
        condition: row.condition || 'Brand New',
        storage: row.storage || '',
        ram: row.ram || '',
        battery: row.battery || '',
        display: row.display || '',
        chip: row.chip || '',
        camera: row.camera || '',
        color: row.color || 'midnight',
        warranty: row.warranty || '',
        stock: Number(row.stock) || 0,
        desc: row.description || '',
        description: row.description || '',
        status: row.status || 'Active',
        images,
        rating: Number(row.rating) || 5.0,
        reviews: Number(row.reviews) || 0,
        views: Number(row.views) || 0,
        tags
      };
    });

    return jsonResponse({ ok: true, products: formatted });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

/**
 * Insert or update product in D1
 */
async function addOrUpdateProduct(product, env) {
  try {
    assertDb(env);
    if (!product || !product.title) {
      return jsonResponse({ ok: false, error: 'Product title is required.' }, 400);
    }

    const id = product.id || ('mg-a' + Date.now().toString(36));
    const created_at = product.created_at || new Date().toISOString();
    const title = String(product.title || '').trim();
    const brand = String(product.brand || 'Apple').trim();
    const category = String(product.category || 'phone').trim();
    const price = Number(product.price) || 0;
    const old_price = Number(product.oldPrice !== undefined ? product.oldPrice : product.old_price) || 0;
    const condition = String(product.condition || 'Brand New').trim();
    const storage = String(product.storage || '').trim();
    const ram = String(product.ram || '').trim();
    const battery = String(product.battery || '').trim();
    const display = String(product.display || '').trim();
    const chip = String(product.chip || '').trim();
    const camera = String(product.camera || '').trim();
    const color = String(product.color || 'midnight').trim();
    const warranty = String(product.warranty || '').trim();
    const stock = Number(product.stock !== undefined ? product.stock : 5);
    const description = String(product.desc || product.description || '').trim();
    const status = String(product.status || 'Active').trim();
    const images = JSON.stringify(Array.isArray(product.images) ? product.images : []);
    const rating = Number(product.rating) || 5.0;
    const reviews = Number(product.reviews) || 0;
    const views = Number(product.views) || 0;
    const tags = JSON.stringify(Array.isArray(product.tags) ? product.tags : []);

    await env.DB.prepare(`
      INSERT INTO products (
        id, created_at, title, brand, category, price, old_price, condition,
        storage, ram, battery, display, chip, camera, color, warranty,
        stock, description, status, images, rating, reviews, views, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        brand = excluded.brand,
        category = excluded.category,
        price = excluded.price,
        old_price = excluded.old_price,
        condition = excluded.condition,
        storage = excluded.storage,
        ram = excluded.ram,
        battery = excluded.battery,
        display = excluded.display,
        chip = excluded.chip,
        camera = excluded.camera,
        color = excluded.color,
        warranty = excluded.warranty,
        stock = excluded.stock,
        description = excluded.description,
        status = excluded.status,
        images = excluded.images,
        tags = excluded.tags
    `).bind(
      id, created_at, title, brand, category, price, old_price, condition,
      storage, ram, battery, display, chip, camera, color, warranty,
      stock, description, status, images, rating, reviews, views, tags
    ).run();

    const savedProduct = {
      ...product,
      id,
      title,
      brand,
      category,
      price,
      oldPrice: old_price,
      stock,
      images: Array.isArray(product.images) ? product.images : []
    };

    return jsonResponse({ ok: true, product: savedProduct, images: savedProduct.images });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

/**
 * Delete product from D1
 */
async function deleteProduct(id, env) {
  try {
    assertDb(env);
    if (!id) return jsonResponse({ ok: false, error: 'Product ID is required.' }, 400);

    await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
    return jsonResponse({ ok: true, id, message: 'Product deleted from D1 database' });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

/**
 * Bulk seed products into D1
 */
async function seedProducts(productsList, env) {
  try {
    assertDb(env);
    if (!Array.isArray(productsList) || !productsList.length) {
      return jsonResponse({ ok: false, error: 'Products array is required.' }, 400);
    }

    const stmts = productsList.map(p => {
      const id = p.id || ('mg-' + Math.random().toString(36).slice(2, 7));
      const created_at = new Date().toISOString();
      const title = p.title || '';
      const brand = p.brand || '';
      const category = p.category || 'phone';
      const price = Number(p.price) || 0;
      const old_price = Number(p.oldPrice || p.old_price) || 0;
      const condition = p.condition || 'Brand New';
      const storage = p.storage || '';
      const ram = p.ram || '';
      const battery = p.battery || '';
      const display = p.display || '';
      const chip = p.chip || '';
      const camera = p.camera || '';
      const color = p.color || 'midnight';
      const warranty = p.warranty || '';
      const stock = Number(p.stock) || 0;
      const description = p.desc || p.description || '';
      const status = p.status || 'Active';
      const images = JSON.stringify(Array.isArray(p.images) ? p.images : []);
      const rating = Number(p.rating) || 5.0;
      const reviews = Number(p.reviews) || 0;
      const views = Number(p.views) || 0;
      const tags = JSON.stringify(Array.isArray(p.tags) ? p.tags : []);

      return env.DB.prepare(`
        INSERT OR REPLACE INTO products (
          id, created_at, title, brand, category, price, old_price, condition,
          storage, ram, battery, display, chip, camera, color, warranty,
          stock, description, status, images, rating, reviews, views, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, created_at, title, brand, category, price, old_price, condition,
        storage, ram, battery, display, chip, camera, color, warranty,
        stock, description, status, images, rating, reviews, views, tags
      );
    });

    await env.DB.batch(stmts);
    return jsonResponse({ ok: true, count: productsList.length, message: 'Products seeded to D1 successfully' });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

/* ============================================================================
   3. Cloudflare D1 Orders Handlers
   ============================================================================ */

/**
 * Fetch all orders from D1
 */
async function getOrders(env) {
  try {
    assertDb(env);
    const { results } = await env.DB.prepare('SELECT * FROM orders ORDER BY placed_at DESC').all();

    const formatted = (results || []).map(row => {
      let details = [];
      try {
        details = typeof row.items_details === 'string' ? JSON.parse(row.items_details) : (row.items_details || []);
      } catch (_) { details = []; }

      return {
        ref: row.ref,
        placedAt: row.placed_at,
        placed_at: row.placed_at,
        name: row.customer_name,
        customer_name: row.customer_name,
        email: row.customer_email || '',
        customer_email: row.customer_email || '',
        phone: row.customer_phone,
        customer_phone: row.customer_phone,
        address: row.address,
        area: row.area || '',
        city: row.city || 'Dhaka',
        payment: row.payment_method || 'cod',
        payment_method: row.payment_method || 'cod',
        count: Number(row.items_count) || 1,
        total: Number(row.total_amount) || 0,
        total_amount: Number(row.total_amount) || 0,
        details,
        items: details,
        status: row.order_status || 'Pending',
        order_status: row.order_status || 'Pending'
      };
    });

    return jsonResponse({ ok: true, orders: formatted });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

/**
 * Place a new order into D1 & decrement product stock
 */
async function placeOrder(order, env) {
  try {
    assertDb(env);
    if (!order) return jsonResponse({ ok: false, error: 'Order details missing.' }, 400);

    const ref = (order.ref || ('MG-' + Math.floor(10000 + Math.random() * 90000))).toUpperCase();
    const placed_at = order.placedAt || order.placed_at || new Date().toISOString();
    const customer_name = String(order.name || order.customer_name || 'Customer').trim();
    const customer_email = String(order.email || order.customer_email || '').trim().toLowerCase();
    const customer_phone = String(order.phone || order.customer_phone || '').trim();
    const address = String(order.address || '').trim();
    const area = String(order.area || '').trim();
    const city = String(order.city || 'Dhaka').trim();
    const payment_method = String(order.payment || order.payment_method || 'Cash on Delivery').trim();

    const items = Array.isArray(order.items) ? order.items : (Array.isArray(order.details) ? order.details : []);
    const items_count = Number(order.count) || (items.reduce((s, it) => s + (it.qty || 1), 0) || 1);
    const total_amount = Number(order.total !== undefined ? order.total : order.total_amount) || 0;
    const items_details = JSON.stringify(items);
    const order_status = String(order.status || order.order_status || 'Pending').trim();

    // 1. Insert order record
    const insertStmt = env.DB.prepare(`
      INSERT INTO orders (
        ref, placed_at, customer_name, customer_email, customer_phone,
        address, area, city, payment_method, items_count, total_amount,
        items_details, order_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      ref, placed_at, customer_name, customer_email, customer_phone,
      address, area, city, payment_method, items_count, total_amount,
      items_details, order_status
    );

    // 2. Decrement stock for ordered items
    const stockStmts = [];
    for (const it of items) {
      if (it && it.id) {
        const qty = Number(it.qty) || 1;
        stockStmts.push(
          env.DB.prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?').bind(qty, it.id)
        );
      }
    }

    await env.DB.batch([insertStmt, ...stockStmts]);

    return jsonResponse({
      ok: true,
      ref,
      order: {
        ref,
        placedAt: placed_at,
        name: customer_name,
        email: customer_email,
        phone: customer_phone,
        total: total_amount,
        status: order_status
      }
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

/**
 * Update order status (Pending, Confirmed, Delivered, Cancelled)
 */
async function updateOrderStatus(orderRef, newStatus, env) {
  try {
    assertDb(env);
    if (!orderRef) return jsonResponse({ ok: false, error: 'Order reference is required.' }, 400);

    let cleanStatus = 'Pending';
    const s = String(newStatus || '').toLowerCase();
    if (s === 'delivered') cleanStatus = 'Delivered';
    else if (s === 'confirmed') cleanStatus = 'Confirmed';
    else if (s === 'cancelled' || s === 'cancel') cleanStatus = 'Cancelled';

    const res = await env.DB.prepare('UPDATE orders SET order_status = ? WHERE upper(ref) = upper(?)')
      .bind(cleanStatus, orderRef.trim())
      .run();

    return jsonResponse({ ok: true, ref: orderRef, status: cleanStatus, affected: res.meta?.changes || 1 });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

/* ============================================================================
   4. Cloudflare D1 Users & Access Handlers
   ============================================================================ */

/**
 * Fetch all registered users
 */
async function getUsers(env) {
  try {
    assertDb(env);
    const { results } = await env.DB.prepare(`
      SELECT id, registered_at, name, email, phone, status
      FROM users
      ORDER BY registered_at DESC
    `).all();

    const formatted = (results || []).map(u => ({
      id: u.id,
      registeredAt: u.registered_at,
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      status: u.status || 'Active'
    }));

    return jsonResponse({ ok: true, users: formatted });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

/**
 * Register a customer account
 */
async function registerUser(userData, env) {
  try {
    assertDb(env);
    const name = String(userData.name || '').trim();
    const email = String(userData.email || '').trim().toLowerCase();
    const phone = String(userData.phone || '').trim();
    const password = String(userData.password || '').trim();

    if (!name || !email || !password) {
      return jsonResponse({ ok: false, error: 'Name, email and password are required.' }, 400);
    }

    // Check existing
    const existing = await env.DB.prepare('SELECT id FROM users WHERE lower(email) = ?').bind(email).first();
    if (existing) {
      return jsonResponse({ ok: false, error: 'Email already registered. Please log in.' }, 409);
    }

    const id = 'USR-' + Math.random().toString(36).slice(2, 9).toUpperCase();
    const registered_at = new Date().toISOString();

    await env.DB.prepare(`
      INSERT INTO users (id, registered_at, name, email, phone, password, status)
      VALUES (?, ?, ?, ?, ?, ?, 'Active')
    `).bind(id, registered_at, name, email, phone, password).run();

    return jsonResponse({
      ok: true,
      user: { id, name, email, phone, registeredAt: registered_at, status: 'Active' }
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

/**
 * Login user
 */
async function loginUser(creds, env) {
  try {
    assertDb(env);
    const email = String(creds.email || '').trim().toLowerCase();
    const password = String(creds.password || '').trim();

    if (!email || !password) {
      return jsonResponse({ ok: false, error: 'Email and password are required.' }, 400);
    }

    const user = await env.DB.prepare(`
      SELECT id, registered_at, name, email, phone, password, status
      FROM users
      WHERE lower(email) = ?
    `).bind(email).first();

    if (!user || user.password !== password) {
      return jsonResponse({ ok: false, error: 'Invalid email or password.' }, 401);
    }

    if (user.status && (user.status.toLowerCase() === 'inactive' || user.status.toLowerCase() === 'suspended')) {
      return jsonResponse({ ok: false, error: `Your account is ${user.status}. Please contact admin for assistance.` }, 403);
    }

    return jsonResponse({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        registeredAt: user.registered_at,
        status: user.status || 'Active'
      }
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

/**
 * Update user status (Active / Inactive / Suspended)
 */
async function updateUserStatus(emailOrId, newStatus, optionalId, env) {
  try {
    assertDb(env);
    const status = String(newStatus || 'Active').trim();
    const query = String(emailOrId || '').trim().toLowerCase();
    const altId = String(optionalId || emailOrId || '').trim();

    const res = await env.DB.prepare(`
      UPDATE users
      SET status = ?
      WHERE lower(email) = ? OR id = ? OR id = ?
    `).bind(status, query, query, altId).run();

    return jsonResponse({ ok: true, status, affected: res.meta?.changes || 1 });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}
