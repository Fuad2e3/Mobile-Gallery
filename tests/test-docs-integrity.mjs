/**
 * ============================================================================
 * Documentation & Contract Automated Verification Suite
 * ============================================================================
 * Automatically validates that all code, schemas, and configurations
 * strictly conform to the specifications written in docs/*.md.
 * ============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('======================================================');
console.log('  MOBILE GALLERY DOCS & CODE INTEGRITY AUTO-TEST');
console.log('======================================================\n');

let pass = 0;
let fail = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    pass++;
  } else {
    console.error(`  [FAIL] ${message}`);
    fail++;
  }
}

// 1. Verify Docs File Structure
console.log('1. Verifying docs/ Directory Files...');
const expectedDocs = [
  'ARCHITECTURE.md',
  'CLOUDFLARE_DEPLOYMENT.md',
  'DESIGN.md',
  'MEMORY.md',
  'PRD.md',
  'RULES.md',
  'TASKS.md'
];

const docsDir = path.join(rootDir, 'docs');
assert(fs.existsSync(docsDir), 'Directory docs/ exists');

for (const doc of expectedDocs) {
  const filePath = path.join(docsDir, doc);
  const exists = fs.existsSync(filePath);
  const size = exists ? fs.statSync(filePath).size : 0;
  assert(exists && size > 1000, `docs/${doc} exists and contains thorough content (${size} bytes)`);
}

// 2. Verify Schema Alignment with docs/ARCHITECTURE.md
console.log('\n2. Verifying D1 Schema Alignment with docs/ARCHITECTURE.md...');
const schemaSql = fs.readFileSync(path.join(rootDir, 'database/schema.sql'), 'utf8');
const archDoc = fs.readFileSync(path.join(docsDir, 'ARCHITECTURE.md'), 'utf8');

assert(schemaSql.includes('CREATE TABLE IF NOT EXISTS users'), 'database/schema.sql defines "users" table');
assert(schemaSql.includes('CREATE TABLE IF NOT EXISTS products'), 'database/schema.sql defines "products" table');
assert(schemaSql.includes('CREATE TABLE IF NOT EXISTS orders'), 'database/schema.sql defines "orders" table');

assert(archDoc.includes('users') && archDoc.includes('products') && archDoc.includes('orders'), 'ARCHITECTURE.md documents users, products, and orders models');

// 3. Verify Seed Data & Catalog
console.log('\n3. Verifying Seed Data & Catalog in database/seed.sql...');
const seedSql = fs.readFileSync(path.join(rootDir, 'database/seed.sql'), 'utf8');
assert(seedSql.includes('admin@mobilegallery.com'), 'database/seed.sql seeds default admin account');
assert(seedSql.includes('admin123'), 'database/seed.sql seeds default admin password');

const productInsertMatches = seedSql.match(/INSERT OR REPLACE INTO products/g) || [];
assert(productInsertMatches.length === 24, `database/seed.sql seeds all 24 built-in products (actual: ${productInsertMatches.length})`);

// 4. Verify Design Palettes with docs/DESIGN.md
console.log('\n4. Verifying Design Tokens & Palettes with docs/DESIGN.md...');
const designDoc = fs.readFileSync(path.join(docsDir, 'DESIGN.md'), 'utf8');
const dataJs = fs.readFileSync(path.join(rootDir, 'src/js/data.js'), 'utf8');

const documentedPalettes = [
  'midnight', 'titanium', 'ocean', 'violet', 'sunset',
  'emerald', 'gold', 'graphite', 'cream', 'cherry', 'mint', 'cobalt'
];

let allPalettesPresent = true;
for (const p of documentedPalettes) {
  if (!dataJs.includes(p + ':') || !designDoc.includes(p)) {
    allPalettesPresent = false;
  }
}
assert(allPalettesPresent, `All 12 dynamic device palettes documented in docs/DESIGN.md exist in data.js`);

// 5. Verify CSS 3D Design Tokens
console.log('\n5. Verifying CSS Tokens in assets/css/style.css...');
const cssContent = fs.readFileSync(path.join(rootDir, 'assets/css/style.css'), 'utf8');
assert(cssContent.includes('--perspective-3d') || cssContent.includes('perspective:'), '3D perspective token exists in style.css');
assert(cssContent.includes('--ease-spring') || cssContent.includes('cubic-bezier'), 'Spring easing token exists in style.css');

// 6. Verify Cloudflare Config in wrangler.toml
console.log('\n6. Verifying Cloudflare Bindings in wrangler.toml & Folder Structure...');
const wranglerToml = fs.readFileSync(path.join(rootDir, 'wrangler.toml'), 'utf8');
assert(wranglerToml.includes('binding = "DB"'), 'wrangler.toml binds D1 database as DB');
assert(wranglerToml.includes('binding = "PHOTOS_BUCKET"'), 'wrangler.toml binds R2 bucket as PHOTOS_BUCKET');
assert(wranglerToml.includes('pages_build_output_dir') || wranglerToml.includes('directory = "."') || wranglerToml.includes('assets'), 'wrangler.toml configures Pages build directory');
assert(fs.existsSync(path.join(rootDir, 'functions/api/[[path]].js')), 'functions/api/[[path]].js catch-all exists');
assert(fs.existsSync(path.join(rootDir, 'database/schema.sql')), 'database/schema.sql exists');
assert(!fs.existsSync(path.join(rootDir, 'worker')), 'Standalone worker directory removed; functions/ is the sole backend');

// 7. Verify Admin Credential Rules
console.log('\n7. Verifying Admin Auth Rules with docs/RULES.md & admin.js...');
const adminJs = fs.readFileSync(path.join(rootDir, 'src/js/admin.js'), 'utf8');
const rulesDoc = fs.readFileSync(path.join(docsDir, 'RULES.md'), 'utf8');

assert(rulesDoc.includes('admin@mobilegallery.com') && rulesDoc.includes('admin123'), 'RULES.md documents fixed admin credentials');
assert(adminJs.includes('admin@mobilegallery.com') && adminJs.includes('admin123'), 'src/js/admin.js verifies fixed admin credentials');

console.log(`\n======================================================`);
console.log(`Docs Auto-Test Complete: ${pass} Passed, ${fail} Failed`);
console.log(`======================================================\n`);

if (fail > 0) {
  process.exit(1);
}
