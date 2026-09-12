/* Mobile Gallery v1.0.0 - Production Protected Build. (c) 2026 Mobile Gallery Inc. All Rights Reserved. Reverse-engineering, redistribution or copying is prohibited. */
const LOCAL_USERS_KEY    = '\x6d\x67\x2e\x75\x73\x65\x72\x73\x2e\x76\x31';
const LOCAL_PRODUCTS_KEY = '\x6d\x67\x2e\x70\x72\x6f\x64\x75\x63\x74\x73\x2e\x76\x31';
const LOCAL_ORDERS_KEY   = '\x6d\x67\x2e\x6f\x72\x64\x65\x72\x73\x2e\x76\x31';
const LOCAL_AUTH_KEY     = '\x6d\x67\x2e\x61\x75\x74\x68\x2e\x75\x73\x65\x72\x2e\x76\x31';
class SheetEndpoint {
  static url = '\x68\x74\x74\x70\x73\x3a\x2f\x2f\x73\x63\x72\x69\x70\x74\x2e\x67\x6f\x6f\x67\x6c\x65\x2e\x63\x6f\x6d\x2f\x6d\x61\x63\x72\x6f\x73\x2f\x73\x2f\x41\x4b\x66\x79\x63\x62\x79\x71\x43\x47\x5f\x50\x6e\x6b\x6c\x46\x43\x38\x67\x55\x75\x44\x34\x30\x66\x6c\x46\x39\x50\x78\x57\x6d\x30\x77\x7a\x72\x4f\x56\x63\x62\x41\x71\x6a\x53\x67\x58\x76\x51\x75\x65\x78\x79\x31\x56\x34\x6d\x4e\x75\x30\x59\x67\x37\x67\x55\x58\x56\x64\x4f\x7a\x65\x70\x34\x2f\x65\x78\x65\x63';
  static isReady() {
    const u = this.getUrl();
    return typeof u === '\x73\x74\x72\x69\x6e\x67' && u.startsWith('\x68\x74\x74\x70\x73\x3a\x2f\x2f\x73\x63\x72\x69\x70\x74\x2e\x67\x6f\x6f\x67\x6c\x65\x2e\x63\x6f\x6d\x2f\x6d\x61\x63\x72\x6f\x73\x2f\x73\x2f');
  }
  static getUrl() {
    try {
      if (typeof localStorage !== '\x75\x6e\x64\x65\x66\x69\x6e\x65\x64') {
        const saved = localStorage.getItem('\x6d\x67\x2e\x73\x68\x65\x65\x74\x2e\x75\x72\x6c');
        if (saved && typeof saved === '\x73\x74\x72\x69\x6e\x67' && saved.trim().startsWith('\x68\x74\x74\x70\x73\x3a\x2f\x2f\x73\x63\x72\x69\x70\x74\x2e\x67\x6f\x6f\x67\x6c\x65\x2e\x63\x6f\x6d\x2f\x6d\x61\x63\x72\x6f\x73\x2f\x73\x2f')) {
          return saved.trim();
        }
      }
    } catch (_) {}
    return (this.url || '').trim();
  }
  static async request(payload) {
    const endpoint = this.getUrl();
    if (!endpoint) {
      return { ok: false, error: '\x53\x68\x65\x65\x74\x20\x65\x6e\x64\x70\x6f\x69\x6e\x74\x20\x55\x52\x4c\x20\x6e\x6f\x74\x20\x63\x6f\x6e\x66\x69\x67\x75\x72\x65\x64\x2e' };
    }
    try {
      const res = await fetch(endpoint, {
        method: '\x50\x4f\x53\x54',
        headers: { '\x43\x6f\x6e\x74\x65\x6e\x74\x2d\x54\x79\x70\x65': '\x74\x65\x78\x74\x2f\x70\x6c\x61\x69\x6e\x3b\x63\x68\x61\x72\x73\x65\x74\x3d\x75\x74\x66\x2d\x38' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        try {
          const json = await res.json();
          return json;
        } catch (parseErr) {
          return { ok: true, note: '\x52\x65\x73\x70\x6f\x6e\x73\x65\x20\x72\x65\x63\x65\x69\x76\x65\x64' };
        }
      } else {
        return { ok: false, status: res.status, error: res.statusText };
      }
    } catch (err) {
      console.warn('\x53\x68\x65\x65\x74\x45\x6e\x64\x70\x6f\x69\x6e\x74\x3a\x20\x4e\x65\x74\x77\x6f\x72\x6b\x20\x72\x65\x71\x75\x65\x73\x74\x20\x66\x61\x69\x6c\x65\x64\x2c\x20\x75\x73\x69\x6e\x67\x20\x6c\x6f\x63\x61\x6c\x20\x66\x61\x6c\x6c\x62\x61\x63\x6b\x2e', err);
      return { ok: false, error: err.message, networkError: true };
    }
  }
  static async get(action) {
    const endpoint = this.getUrl();
    if (!endpoint) {
      return { ok: false, error: '\x53\x68\x65\x65\x74\x20\x65\x6e\x64\x70\x6f\x69\x6e\x74\x20\x55\x52\x4c\x20\x6e\x6f\x74\x20\x63\x6f\x6e\x66\x69\x67\x75\x72\x65\x64\x2e' };
    }
    try {
      const urlWithAction = endpoint + (endpoint.includes('\x3f') ? '\x26' : '\x3f') + '\x61\x63\x74\x69\x6f\x6e\x3d' + encodeURIComponent(action);
      const res = await fetch(urlWithAction, { method: '\x47\x45\x54' });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn(`SheetEndpoint: GET ${action} failed, attempting POST fallback:`, err);
    }
    return await this.request({ action });
  }
  static async ping() {
    if (!this.isReady()) {
      return { ok: false, error: '\x45\x6e\x64\x70\x6f\x69\x6e\x74\x20\x55\x52\x4c\x20\x6e\x6f\x74\x20\x63\x6f\x6e\x66\x69\x67\x75\x72\x65\x64\x2e' };
    }
    const start = Date.now();
    try {
      const res = await this.get('\x70\x69\x6e\x67');
      const latency = Date.now() - start;
      return { ...res, latency };
    } catch (err) {
      return { ok: false, error: err.message, latency: Date.now() - start };
    }
  }
  static async registerUser(userData) {
    const userPayload = {
      action: '\x72\x65\x67\x69\x73\x74\x65\x72\x5f\x75\x73\x65\x72',
      name: userData.name,
      email: (userData.email || '').trim().toLowerCase(),
      phone: userData.phone,
      password: userData.password
    };
    const users = this.getLocal(LOCAL_USERS_KEY, []);
    const existing = users.find(u => u.email === userPayload.email);
    if (existing) {
      return { ok: false, error: '\x41\x6e\x20\x61\x63\x63\x6f\x75\x6e\x74\x20\x77\x69\x74\x68\x20\x74\x68\x69\x73\x20\x65\x6d\x61\x69\x6c\x20\x61\x6c\x72\x65\x61\x64\x79\x20\x65\x78\x69\x73\x74\x73\x2e' };
    }
    const localUser = {
      id: '\x55\x53\x52\x2d' + Math.random().toString(36).slice(2, 9).toUpperCase(),
      name: userPayload.name,
      email: userPayload.email,
      phone: userPayload.phone,
      password: userPayload.password,
      createdAt: new Date().toISOString()
    };
    users.push(localUser);
    this.setLocal(LOCAL_USERS_KEY, users);
    this.setCurrentUser(localUser);
    if (this.isReady()) {
      this.request(userPayload).then(res => {
        if (res.ok && res.user && res.user.id) {
          localUser.id = res.user.id;
          this.setCurrentUser(localUser);
        }
      });
    }
    return { ok: true, user: localUser };
  }
  static async loginUser(creds) {
    const email = (creds.email || '').trim().toLowerCase();
    const password = (creds.password || '').trim();
    const users = this.getLocal(LOCAL_USERS_KEY, []);
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      if (found.status && (found.status.toLowerCase() === '\x73\x75\x73\x70\x65\x6e\x64\x65\x64' || found.status.toLowerCase() === '\x69\x6e\x61\x63\x74\x69\x76\x65')) {
        return { ok: false, error: '\x59\x6f\x75\x72\x20\x61\x63\x63\x6f\x75\x6e\x74\x20\x69\x73\x20' + found.status + '\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x63\x6f\x6e\x74\x61\x63\x74\x20\x61\x64\x6d\x69\x6e\x20\x66\x6f\x72\x20\x61\x73\x73\x69\x73\x74\x61\x6e\x63\x65\x2e' };
      }
      this.setCurrentUser(found);
      return { ok: true, user: found };
    }
    if (this.isReady()) {
      const res = await this.request({ action: '\x6c\x6f\x67\x69\x6e\x5f\x75\x73\x65\x72', email, password });
      if (res.ok && res.user) {
        this.setCurrentUser(res.user);
        const existingIdx = users.findIndex(u => u.email === res.user.email);
        if (existingIdx > -1) {
          users[existingIdx] = { ...users[existingIdx], ...res.user, password };
        } else {
          users.push({ ...res.user, password });
        }
        this.setLocal(LOCAL_USERS_KEY, users);
        return { ok: true, user: res.user };
      }
      if (res.error) {
        return { ok: false, error: res.error };
      }
    }
    return { ok: false, error: '\x49\x6e\x76\x61\x6c\x69\x64\x20\x65\x6d\x61\x69\x6c\x20\x6f\x72\x20\x70\x61\x73\x73\x77\x6f\x72\x64\x2e' };
  }
  static async fetchUsers() {
    if (this.isReady()) {
      const res = await this.get('\x67\x65\x74\x5f\x75\x73\x65\x72\x73');
      if (res.ok && Array.isArray(res.users)) {
        const local = this.getLocal(LOCAL_USERS_KEY, []);
        const sheetMap = new Map(res.users.map(u => [u.email, u]));
        const merged = local.map(u => sheetMap.get(u.email) ? { ...u, ...sheetMap.get(u.email) } : u);
        res.users.forEach(u => {
          if (!merged.find(m => m.email === u.email)) merged.push(u);
        });
        this.setLocal(LOCAL_USERS_KEY, merged);
        try { localStorage.setItem('\x6d\x67\x2e\x75\x73\x65\x72\x73\x2e\x63\x61\x63\x68\x65\x2e\x76\x31', JSON.stringify(merged)); } catch (_) {}
        return merged.length ? merged : res.users;
      }
    }
    const local = this.getLocal(LOCAL_USERS_KEY, []);
    return local.length ? local : this.getLocal('\x6d\x67\x2e\x75\x73\x65\x72\x73\x2e\x63\x61\x63\x68\x65\x2e\x76\x31', []);
  }
  static async updateUserStatus(emailOrId, newStatus, optionalId) {
    const cleanStatus = String(newStatus || '\x41\x63\x74\x69\x76\x65').trim();
    const queryEmail = String(emailOrId || '').trim().toLowerCase();
    const queryId = String(optionalId || emailOrId || '').trim();
    const users = this.getLocal(LOCAL_USERS_KEY, []);
    const user = users.find(u =>
      (u.email && u.email.toLowerCase() === queryEmail) ||
      (u.id && (u.id === queryId || u.id === emailOrId))
    );
    if (user) {
      user.status = cleanStatus;
      this.setLocal(LOCAL_USERS_KEY, users);
    }
    try {
      if (typeof localStorage !== '\x75\x6e\x64\x65\x66\x69\x6e\x65\x64') {
        const cacheRaw = localStorage.getItem('\x6d\x67\x2e\x75\x73\x65\x72\x73\x2e\x63\x61\x63\x68\x65\x2e\x76\x31');
        if (cacheRaw) {
          const cache = JSON.parse(cacheRaw);
          const cu = cache.find(u =>
            (u.email && u.email.toLowerCase() === queryEmail) ||
            (u.id && (u.id === queryId || u.id === emailOrId))
          );
          if (cu) {
            cu.status = cleanStatus;
            localStorage.setItem('\x6d\x67\x2e\x75\x73\x65\x72\x73\x2e\x63\x61\x63\x68\x65\x2e\x76\x31', JSON.stringify(cache));
          }
        }
      }
    } catch (_) {}
    if (this.isReady()) {
      const payload = {
        action: '\x75\x70\x64\x61\x74\x65\x5f\x75\x73\x65\x72\x5f\x73\x74\x61\x74\x75\x73',
        email: (user && user.email) ? user.email : queryEmail,
        id: (user && user.id) ? user.id : queryId,
        userId: (user && user.id) ? user.id : queryId,
        status: cleanStatus
      };
      const res = await this.request(payload);
      return res;
    }
    return { ok: true, localOnly: true, status: cleanStatus };
  }
  static getCurrentUser() {
    return this.getLocal(LOCAL_AUTH_KEY, null);
  }
  static setCurrentUser(user) {
    if (!user) {
      try { localStorage.removeItem(LOCAL_AUTH_KEY); } catch (_) {}
      return;
    }
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || ''
    };
    this.setLocal(LOCAL_AUTH_KEY, safeUser);
  }
  static logoutUser() {
    this.setCurrentUser(null);
  }
  static async addProduct(product) {
    const payload = {
      action: '\x61\x64\x64\x5f\x70\x72\x6f\x64\x75\x63\x74',
      ...product
    };
    const added = this.getLocal(LOCAL_PRODUCTS_KEY, []);
    added.unshift(product);
    this.setLocal(LOCAL_PRODUCTS_KEY, added);
    if (this.isReady()) {
      const res = await this.request(payload);
      if (res && res.ok && Array.isArray(res.images) && res.images.length) {
        product.images = res.images;
        const currentAdded = this.getLocal(LOCAL_PRODUCTS_KEY, []);
        const target = currentAdded.find(p => p.id === product.id);
        if (target) {
          target.images = res.images;
          this.setLocal(LOCAL_PRODUCTS_KEY, currentAdded);
        }
      }
      return res.ok ? { ok: true, product } : { ok: true, localOnly: true, note: res.error };
    }
    return { ok: true, localOnly: true };
  }
  static async updateProduct(product) {
    if (typeof updateAnyProduct === '\x66\x75\x6e\x63\x74\x69\x6f\x6e') {
      updateAnyProduct(product);
    } else {
      const added = this.getLocal(LOCAL_PRODUCTS_KEY, []);
      const idx = added.findIndex(p => p.id === product.id);
      if (idx > -1) added[idx] = product; else added.unshift(product);
      this.setLocal(LOCAL_PRODUCTS_KEY, added);
    }
    if (this.isReady()) {
      const res = await this.request({ action: '\x75\x70\x64\x61\x74\x65\x5f\x70\x72\x6f\x64\x75\x63\x74', ...product });
      if (res && res.ok && Array.isArray(res.images) && res.images.length) {
        product.images = res.images;
        if (typeof updateAnyProduct === '\x66\x75\x6e\x63\x74\x69\x6f\x6e') {
          updateAnyProduct(product);
        } else {
          const added = this.getLocal(LOCAL_PRODUCTS_KEY, []);
          const idx = added.findIndex(p => p.id === product.id);
          if (idx > -1) added[idx].images = res.images;
          this.setLocal(LOCAL_PRODUCTS_KEY, added);
        }
      }
      return { ok: true, sheetSync: res.ok, note: res.error, images: res.images };
    }
    return { ok: true, localOnly: true };
  }
  static async deleteProduct(productId) {
    if (typeof deleteAnyProduct === '\x66\x75\x6e\x63\x74\x69\x6f\x6e') {
      deleteAnyProduct(productId);
    } else {
      const added = this.getLocal(LOCAL_PRODUCTS_KEY, []);
      const kept = added.filter(p => p.id !== productId);
      this.setLocal(LOCAL_PRODUCTS_KEY, kept);
    }
    if (this.isReady()) {
      const res = await this.request({ action: '\x64\x65\x6c\x65\x74\x65\x5f\x70\x72\x6f\x64\x75\x63\x74', id: productId });
      return { ok: true, sheetSync: res.ok, note: res.error };
    }
    return { ok: true, localOnly: true };
  }
  static async seedProducts(productsList) {
    if (this.isReady()) {
      const res = await this.request({ action: '\x73\x65\x65\x64\x5f\x70\x72\x6f\x64\x75\x63\x74\x73', products: productsList });
      return res;
    }
    return { ok: true, localOnly: true };
  }
  static async fetchProducts() {
    if (this.isReady()) {
      const res = await this.get('\x67\x65\x74\x5f\x70\x72\x6f\x64\x75\x63\x74\x73');
      if (res.ok && Array.isArray(res.products) && res.products.length > 0) {
        const local = this.getLocal(LOCAL_PRODUCTS_KEY, []);
        const sheetIds = new Set(res.products.map(p => p.id));
        const merged = [...res.products, ...local.filter(p => !sheetIds.has(p.id))];
        this.setLocal(LOCAL_PRODUCTS_KEY, merged);
        return merged;
      }
    }
    return this.getLocal(LOCAL_PRODUCTS_KEY, []);
  }
  static async placeOrder(orderData) {
    const payload = {
      action: '\x70\x6c\x61\x63\x65\x5f\x6f\x72\x64\x65\x72',
      ...orderData
    };
    const orders = this.getLocal(LOCAL_ORDERS_KEY, []);
    orders.unshift(orderData);
    this.setLocal(LOCAL_ORDERS_KEY, orders);
    if (this.isReady()) {
      const res = await this.request(payload);
      return res.ok ? res : { ok: true, sheetSync: false, note: res.error };
    }
    return { ok: true, localOnly: true };
  }
  static async fetchOrders() {
    if (this.isReady()) {
      const res = await this.get('\x67\x65\x74\x5f\x6f\x72\x64\x65\x72\x73');
      if (res.ok && Array.isArray(res.orders) && res.orders.length > 0) {
        const local = this.getLocal(LOCAL_ORDERS_KEY, []);
        const localMap = new Map();
        local.forEach(o => {
          if (o && o.ref) localMap.set(String(o.ref).trim().toUpperCase(), o);
        });
        const merged = res.orders.map(so => {
          const key = String(so.ref).trim().toUpperCase();
          const lo = localMap.get(key);
          if (lo) {
            return {
              ...lo,
              status: so.status || lo.status,
              total: so.total !== undefined ? so.total : lo.total,
              details: so.details || lo.details,
              placedAt: so.placedAt || lo.placedAt,
              name: so.name || lo.name,
              email: so.email || lo.email,
              phone: so.phone || lo.phone,
              address: so.address || lo.address,
              area: so.area || lo.area,
              city: so.city || lo.city,
              payment: so.payment || lo.payment
            };
          }
          return so;
        });
        const sheetRefs = new Set(res.orders.map(o => String(o.ref).trim().toUpperCase()));
        local.forEach(lo => {
          if (lo && lo.ref && !sheetRefs.has(String(lo.ref).trim().toUpperCase())) {
            merged.push(lo);
          }
        });
        this.setLocal(LOCAL_ORDERS_KEY, merged);
        try {
          window.dispatchEvent(new CustomEvent('\x6d\x67\x3a\x6f\x72\x64\x65\x72\x73\x2d\x75\x70\x64\x61\x74\x65\x64', { detail: { orders: merged } }));
        } catch (_) {}
        return merged;
      }
    }
    return this.getLocal(LOCAL_ORDERS_KEY, []);
  }
  static async updateOrderStatus(orderRef, newStatus) {
    let cleanStatus = '\x50\x65\x6e\x64\x69\x6e\x67';
    const s = String(newStatus || '').trim().toLowerCase();
    if (s === '\x64\x65\x6c\x69\x76\x65\x72\x65\x64') cleanStatus = '\x44\x65\x6c\x69\x76\x65\x72\x65\x64';
    else if (s === '\x63\x6f\x6e\x66\x69\x72\x6d\x65\x64') cleanStatus = '\x43\x6f\x6e\x66\x69\x72\x6d\x65\x64';
    else if (s === '\x63\x61\x6e\x63\x65\x6c' || s === '\x63\x61\x6e\x63\x65\x6c\x6c\x65\x64') cleanStatus = '\x43\x61\x6e\x63\x65\x6c\x6c\x65\x64';
    else cleanStatus = '\x50\x65\x6e\x64\x69\x6e\x67';
    const orders = this.getLocal(LOCAL_ORDERS_KEY, []);
    const target = orders.find(o => String(o.ref).trim().toUpperCase() === String(orderRef).trim().toUpperCase());
    if (target) {
      target.status = cleanStatus;
      this.setLocal(LOCAL_ORDERS_KEY, orders);
    }
    try {
      window.dispatchEvent(new CustomEvent('\x6d\x67\x3a\x6f\x72\x64\x65\x72\x73\x2d\x75\x70\x64\x61\x74\x65\x64', { detail: { ref: orderRef, status: cleanStatus } }));
    } catch (_) {}
    if (this.isReady()) {
      const res = await this.request({
        action: '\x75\x70\x64\x61\x74\x65\x5f\x6f\x72\x64\x65\x72\x5f\x73\x74\x61\x74\x75\x73',
        ref: orderRef,
        status: cleanStatus
      });
      return { ok: true, sheetSync: res.ok, status: cleanStatus, note: res.error };
    }
    return { ok: true, localOnly: true, status: cleanStatus };
  }
  static getLocal(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }
  static setLocal(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch (_) {
      return false;
    }
  }
  static submit(data) {
    return this.request(data);
  }
}
if (typeof window !== '\x75\x6e\x64\x65\x66\x69\x6e\x65\x64') {
  window.SheetEndpoint = SheetEndpoint;
}
if (typeof module !== '\x75\x6e\x64\x65\x66\x69\x6e\x65\x64' && module.exports) {
  module.exports = SheetEndpoint;
}