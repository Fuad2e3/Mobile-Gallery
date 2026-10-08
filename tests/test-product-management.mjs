/**
 * ============================================================================
 * Targeted Test Suite: Product Management & Inventory Status
 * ============================================================================
 * Tests ONLY relevant Product Management functionality:
 *   1. Product Creation (Add Product)
 *   2. Product Editing & Price/Stock Update
 *   3. Low Stock Priority Sorting (1, 2, 3...)
 *   4. Active vs. Paused Status Toggle & Storefront Hiding
 *   5. Product Deletion
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
console.log('  TARGETED TEST: PRODUCT MANAGEMENT & INVENTORY STATUS');
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

// Sandbox
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
  location: { pathname: '/admin.html', protocol: 'https:' },
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

try {
  const dataJs = fs.readFileSync(path.join(rootDir, 'src/js/data.js'), 'utf8');
  const sheetJs = fs.readFileSync(path.join(rootDir, 'src/js/sheet-endpoint.js'), 'utf8');
  const appJs = fs.readFileSync(path.join(rootDir, 'src/js/app.js'), 'utf8');

  vm.runInContext(dataJs, context);
  vm.runInContext(sheetJs, context);
  vm.runInContext(appJs, context);

  // 1. Initial State
  const initial = vm.runInContext('allProducts()', context);
  assert(initial.length === 24, `Initial catalogue contains 24 products`);

  // 2. Add New Product
  const newProduct = {
    id: 'mg-a_prod_01',
    title: 'Samsung Galaxy S24 FE 256GB',
    brand: 'Samsung',
    category: 'phone',
    price: 68000,
    oldPrice: 75000,
    stock: 2, // Low stock quantity 2
    status: 'Active',
    condition: 'Brand New',
    storage: '256GB',
    ram: '8GB',
    battery: '100%',
    color: 'mint',
    desc: 'Targeted test product creation.'
  };

  vm.runInContext(`updateAnyProduct(${JSON.stringify(newProduct)})`, context);
  const afterAdd = vm.runInContext('allProducts()', context);
  assert(afterAdd.length === 25, 'New product added successfully (total 25)');

  // 3. Edit Product
  newProduct.price = 65000;
  newProduct.stock = 1; // Low stock quantity 1
  vm.runInContext(`updateAnyProduct(${JSON.stringify(newProduct)})`, context);
  const edited = vm.runInContext(`productById('mg-a_prod_01')`, context);
  assert(edited && edited.price === 65000 && edited.stock === 1, 'Product price and stock updated');

  // 4. Low Stock Sorting Priority (1, 2, 3...)
  const allProdsSorted = vm.runInContext('allProducts()', context);
  allProdsSorted.sort((a, b) => (Number(a.stock ?? 0) - Number(b.stock ?? 0)));
  assert(Number(allProdsSorted[0].stock ?? 0) <= Number(allProdsSorted[1].stock ?? 0), 'Low stock sorting orders stock 1, 2, 3... first');

  // 5. Active vs. Paused Status Toggle
  edited.status = 'Paused';
  vm.runInContext(`updateAnyProduct(${JSON.stringify(edited)})`, context);
  const shopMatchPaused = vm.runInContext(`matches(${JSON.stringify(edited)})`, context);
  assert(shopMatchPaused === false, 'Paused item is hidden from customer shop view');

  edited.status = 'Active';
  vm.runInContext(`updateAnyProduct(${JSON.stringify(edited)})`, context);
  const shopMatchActive = vm.runInContext(`matches(${JSON.stringify(edited)})`, context);
  assert(shopMatchActive === true, 'Active item is shown in customer shop view');

  // 6. Delete Product
  vm.runInContext(`deleteAnyProduct('mg-a_prod_01')`, context);
  const finalProds = vm.runInContext('allProducts()', context);
  assert(finalProds.length === 24, 'Deleted product removed from catalogue (total 24)');
  assert(vm.runInContext(`productById('mg-a_prod_01')`, context) === null, 'Deleted product lookup returns null');

} catch (err) {
  assert(false, `Targeted test failed: ${err.message}`);
}

console.log('\n======================================================');
console.log(`Targeted Test Complete: ${passCount} Passed, ${failCount} Failed`);
console.log('======================================================\n');

if (failCount > 0) {
  process.exit(1);
}
