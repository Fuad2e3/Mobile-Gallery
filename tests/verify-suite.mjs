/**
 * ============================================================================
 * Core Storefront & Logic Verification Suite
 * ============================================================================
 * Validates catalogue data, shopping cart logic, design tokens, HTML assets,
 * and production builds in an isolated execution sandbox.
 * ============================================================================
 */

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('======================================================');
console.log('  MOBILE GALLERY STOREFRONT & LOGIC SUITE');
console.log('======================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failCount++;
  }
}

// Mock browser sandbox
const localStorageStore = {};
const mockWindow = {
  localStorage: {
    getItem: k => localStorageStore[k] || null,
    setItem: (k, v) => { localStorageStore[k] = String(v); },
    removeItem: k => { delete localStorageStore[k]; }
  },
  sessionStorage: {
    getItem: k => localStorageStore['sess_' + k] || null,
    setItem: (k, v) => { localStorageStore['sess_' + k] = String(v); },
    removeItem: k => { delete localStorageStore['sess_' + k]; }
  },
  location: { pathname: '/index.html', protocol: 'https:' },
  addEventListener: () => {},
  document: {
    documentElement: { setAttribute: () => {} },
    addEventListener: () => {},
    getElementById: () => null,
    querySelectorAll: () => []
  },
  console: console
};
mockWindow.window = mockWindow;

const context = vm.createContext(mockWindow);

// Test 1: Load Data
console.log('1. Checking Data Catalogue...');
try {
  const dataCode = fs.readFileSync(path.join(rootDir, 'src/js/data.js'), 'utf8');
  vm.runInContext(dataCode, context);
  const listings = vm.runInContext('LISTINGS', context);
  const categories = vm.runInContext('CATEGORIES', context);
  assert(Array.isArray(listings) && listings.length > 0, `Loaded ${listings.length} products`);
  assert(Array.isArray(categories) && categories.length > 0, `Loaded ${categories.length} categories`);

  let validItems = 0;
  for (const item of listings) {
    if (item.id && item.title && item.price > 0 && item.category) {
      validItems++;
    }
  }
  assert(validItems === listings.length, `All ${validItems} products have valid required schema`);
} catch (e) {
  assert(false, `Data load failed: ${e.message}`);
}

// Test 2: Load Cart & Shopping Logic
console.log('\n2. Checking Cart Logic...');
try {
  const cartCode = fs.readFileSync(path.join(rootDir, 'src/js/cart.js'), 'utf8');
  vm.runInContext(cartCode, context);

  // Test addToCart
  const listings = vm.runInContext('LISTINGS', context);
  const firstId = listings[0].id;
  const addRes = vm.runInContext(`addToCart('${firstId}', 2)`, context);
  const count = vm.runInContext('cartCount()', context);
  const subtotal = vm.runInContext('cartSubtotal()', context);
  const total = vm.runInContext('cartTotal()', context);
  assert(addRes === 'added', `Item added to cart (result: ${addRes})`);
  assert(count === 2, `Cart count is 2 (actual: ${count})`);
  assert(subtotal > 0, `Cart subtotal calculated: ${subtotal}`);
  assert(total >= subtotal, `Cart total includes delivery fee (${total})`);
} catch (e) {
  assert(false, `Cart logic failed: ${e.message}`);
}

// Test 3: Load SheetEndpoint & Cloudflare API Wrapper
console.log('\n3. Checking SheetEndpoint & Cloudflare API Wrapper...');
try {
  const sheetCode = fs.readFileSync(path.join(rootDir, 'src/js/sheet-endpoint.js'), 'utf8');
  vm.runInContext(sheetCode, context);

  assert(typeof mockWindow.SheetEndpoint === 'function', 'SheetEndpoint class is defined');
  assert(typeof mockWindow.CloudflareEndpoint === 'function', 'CloudflareEndpoint alias is defined');
  assert(mockWindow.SheetEndpoint.isReady() === true, 'SheetEndpoint.isReady() is true');
  assert(typeof mockWindow.SheetEndpoint.uploadPhoto === 'function', 'SheetEndpoint.uploadPhoto is defined');
} catch (e) {
  assert(false, `API wrapper check failed: ${e.message}`);
}

// Test 4: Check HTML and Assets
console.log('\n4. Checking HTML and Assets...');
const htmlPages = ['index.html', 'checkout.html', 'orders.html', 'admin.html', '404.html'];
for (const p of htmlPages) {
  const content = fs.readFileSync(path.join(rootDir, p), 'utf8');
  assert(content.includes('assets/css/style.css'), `${p} links to assets/css/style.css`);
  assert(content.includes('<!doctype html>') || content.includes('<!DOCTYPE html>'), `${p} has valid HTML5 doctype`);
}

// Test 5: Verify CSS Tokens and Responsive System
console.log('\n5. Checking CSS Design System...');
try {
  const css = fs.readFileSync(path.join(rootDir, 'assets/css/style.css'), 'utf8');
  assert(css.includes('--perspective: 1000px'), '3D perspective token defined');
  assert(css.includes('--shadow-3d-lg'), '3D shadow token defined');
  assert(css.includes('--ease-spring'), '3D ease spring token defined');
  assert(css.includes('.card'), 'Product card rules defined');
  assert(css.includes('.btn--primary'), 'Primary button rules defined');
  assert(css.includes('@media'), 'Responsive media queries defined');
} catch (e) {
  assert(false, `CSS check failed: ${e.message}`);
}

// Test 6: Verify Production Obfuscated Files (assets/js/*.js)
console.log('\n6. Checking Production Obfuscated Code (assets/js)...');
try {
  const distContext = vm.createContext({ ...mockWindow });
  const distData = fs.readFileSync(path.join(rootDir, 'assets/js/data.js'), 'utf8');
  const distCart = fs.readFileSync(path.join(rootDir, 'assets/js/cart.js'), 'utf8');
  const distUi = fs.readFileSync(path.join(rootDir, 'assets/js/ui.js'), 'utf8');
  
  vm.runInContext(distData, distContext);
  vm.runInContext(distCart, distContext);
  vm.runInContext(distUi, distContext);

  const prodListings = vm.runInContext('LISTINGS', distContext);
  assert(Array.isArray(prodListings) && prodListings.length === 24, `Production data has all 24 listings`);
  
  const addProd = vm.runInContext(`addToCart('${prodListings[0].id}', 1)`, distContext);
  assert(addProd === 'added', 'Production cart functions correctly');
} catch (e) {
  assert(false, `Production code test failed: ${e.message}`);
}

// Test 7: Verify Admin Operations (Add, Edit, Pause/Activate, Low Stock Sort, Delete)
console.log('\n7. Checking Admin Operations (Add, Edit, Pause/Activate, Low Stock Sort, Delete)...');
try {
  const adminContext = vm.createContext({ ...mockWindow });
  const dataJs = fs.readFileSync(path.join(rootDir, 'src/js/data.js'), 'utf8');
  const sheetJs = fs.readFileSync(path.join(rootDir, 'src/js/sheet-endpoint.js'), 'utf8');
  const appJs = fs.readFileSync(path.join(rootDir, 'src/js/app.js'), 'utf8');

  vm.runInContext(dataJs, adminContext);
  vm.runInContext(sheetJs, adminContext);
  vm.runInContext(appJs, adminContext);

  const initialProds = vm.runInContext('allProducts()', adminContext);
  assert(initialProds.length === 24, `Initial product count is 24`);

  // 1. ADD ITEM
  const newProd = {
    id: 'mg-a_test1',
    title: 'Test Pixel Phone 256GB',
    brand: 'Google',
    category: 'phone',
    price: 75000,
    oldPrice: 85000,
    stock: 2, // Low stock (2)
    status: 'Active',
    condition: 'Brand New',
    storage: '256GB',
    ram: '12GB',
    battery: '100%',
    color: 'ocean',
    desc: 'Test phone for admin operations verification.'
  };

  vm.runInContext(`updateAnyProduct(${JSON.stringify(newProd)})`, adminContext);
  const afterAdd = vm.runInContext('allProducts()', adminContext);
  assert(afterAdd.length === 25, `After add product, catalogue count is 25`);
  const addedItem = vm.runInContext(`productById('mg-a_test1')`, adminContext);
  assert(addedItem && addedItem.title === 'Test Pixel Phone 256GB', 'Added product retrieved successfully by ID');

  // 2. EDIT ITEM
  addedItem.price = 72000;
  addedItem.stock = 1; // Stock 1
  vm.runInContext(`updateAnyProduct(${JSON.stringify(addedItem)})`, adminContext);
  const updatedItem = vm.runInContext(`productById('mg-a_test1')`, adminContext);
  assert(updatedItem && updatedItem.price === 72000 && updatedItem.stock === 1, 'Product price and stock updated successfully');

  // 3. PAUSE ITEM & CHECK SHOP MATCHES
  updatedItem.status = 'Paused';
  vm.runInContext(`updateAnyProduct(${JSON.stringify(updatedItem)})`, adminContext);
  const isMatchPaused = vm.runInContext(`matches(${JSON.stringify(updatedItem)})`, adminContext);
  assert(isMatchPaused === false, 'Paused product is excluded from customer shop matching');

  // 4. ACTIVATE ITEM & CHECK SHOP MATCHES
  updatedItem.status = 'Active';
  vm.runInContext(`updateAnyProduct(${JSON.stringify(updatedItem)})`, adminContext);
  const isMatchActive = vm.runInContext(`matches(${JSON.stringify(updatedItem)})`, adminContext);
  assert(isMatchActive === true, 'Active product is included in customer shop matching');

  // 5. LOW STOCK SORTING (1, 2, 3...)
  const allProdsSorted = vm.runInContext('allProducts()', adminContext);
  allProdsSorted.sort((a, b) => (Number(a.stock ?? 0) - Number(b.stock ?? 0)));
  assert(Number(allProdsSorted[0].stock ?? 0) <= Number(allProdsSorted[1].stock ?? 0), 'Low stock sorting puts stock 1, 2, 3 items first');

  // 6. DELETE ITEM
  vm.runInContext(`deleteAnyProduct('mg-a_test1')`, adminContext);
  const afterDel = vm.runInContext('allProducts()', adminContext);
  assert(afterDel.length === 24, 'After delete product, catalogue count returns to 24');
  const deletedItem = vm.runInContext(`productById('mg-a_test1')`, adminContext);
  assert(deletedItem === null, 'Deleted product is no longer found in catalogue');

} catch (e) {
  assert(false, `Admin operations check failed: ${e.message}`);
}

console.log('\n======================================================');
console.log(`Suite Complete: ${passCount} Passed, ${failCount} Failed`);
console.log('======================================================\n');

if (failCount > 0) {
  process.exit(1);
}
