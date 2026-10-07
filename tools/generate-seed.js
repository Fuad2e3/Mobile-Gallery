const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ctx = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/js/data.js'), 'utf8'), ctx);
const listings = vm.runInContext('LISTINGS', ctx);

let sql = '-- ============================================================================\n';
sql += '-- Mobile Gallery — Cloudflare D1 Seed Data (Initial Catalogue & Admin)\n';
sql += '-- ============================================================================\n\n';

sql += '-- 1. Admin User\n';
sql += "INSERT OR IGNORE INTO users (id, registered_at, name, email, phone, password, status) VALUES\n";
sql += "('USR-ADMIN-01', '2026-01-01T00:00:00.000Z', 'Administrator', 'admin@mobilegallery.com', '+8801700000000', 'admin123', 'Active');\n\n";

sql += '-- 2. Initial Products Catalogue (24 Products)\n';
const productRows = listings.map(p => {
  const esc = (s) => (s !== undefined && s !== null ? String(s).replace(/'/g, "''") : '');
  const id = esc(p.id);
  const created_at = new Date(Date.now() - (p.added || 1) * 86400000).toISOString();
  const title = esc(p.title);
  const brand = esc(p.brand);
  const category = esc(p.category);
  const price = Number(p.price) || 0;
  const old_price = Number(p.oldPrice) || 0;
  const condition = esc(p.condition);
  const storage = esc(p.storage);
  const ram = esc(p.ram);
  const battery = esc(p.battery);
  const display = esc(p.display);
  const chip = esc(p.chip);
  const camera = esc(p.camera);
  const color = esc(p.color);
  const warranty = esc(p.warranty);
  const stock = Number(p.stock) || 0;
  const description = esc(p.desc);
  const images = esc(JSON.stringify(p.images || []));
  const rating = Number(p.rating) || 5.0;
  const reviews = Number(p.reviews) || 0;
  const views = Number(p.views) || 0;
  const tags = esc(JSON.stringify(p.tags || []));

  return `INSERT OR REPLACE INTO products (id, created_at, title, brand, category, price, old_price, condition, storage, ram, battery, display, chip, camera, color, warranty, stock, description, status, images, rating, reviews, views, tags) VALUES ('${id}', '${created_at}', '${title}', '${brand}', '${category}', ${price}, ${old_price}, '${condition}', '${storage}', '${ram}', '${battery}', '${display}', '${chip}', '${camera}', '${color}', '${warranty}', ${stock}, '${description}', 'Active', '${images}', ${rating}, ${reviews}, ${views}, '${tags}');`;
});

sql += productRows.join('\n') + '\n';
fs.writeFileSync(path.join(__dirname, '../database/seed.sql'), sql, 'utf8');
console.log('database/seed.sql generated successfully with', listings.length, 'products');
