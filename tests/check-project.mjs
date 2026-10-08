/**
 * ============================================================================
 * HTML & Asset Link Integrity Validator
 * ============================================================================
 * Scans all HTML files in project root to verify:
 *   1. All referenced <script src="..."> files exist on disk
 *   2. All referenced <link href="..."> stylesheets exist on disk
 *   3. No duplicate HTML id attributes exist on any page
 * ============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const rootHtmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html')).map(f => path.join(rootDir, f));
const assetsDir = path.join(rootDir, 'assets');
const assetHtmlFiles = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir).filter(f => f.endsWith('.html')).map(f => path.join(assetsDir, f)) : [];
const htmlFiles = [...rootHtmlFiles, ...assetHtmlFiles];
let errors = 0;

console.log('======================================================');
console.log('  PROJECT HTML & STATIC ASSETS VALIDATION');
console.log('======================================================');

for (const filePath of htmlFiles) {
  const relName = path.relative(rootDir, filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const baseDir = path.dirname(filePath);
  console.log(`\n--- Checking ${relName} ---`);

  // 1. Check script tags
  const scriptRegex = /<script[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = scriptRegex.exec(content)) !== null) {
    const rawSrc = match[1];
    const src = rawSrc.split('?')[0];
    if (src.startsWith('http') || src.startsWith('//')) continue;
    const resolved = path.resolve(baseDir, src);
    if (!fs.existsSync(resolved)) {
      console.error(`  [FAIL script] ${relName} -> ${rawSrc} NOT FOUND`);
      errors++;
    } else {
      console.log(`  [OK script] ${rawSrc}`);
    }
  }

  // 2. Check stylesheet links
  const linkRegex = /<link[^>]+href=["']([^"']+)["'][^>]*>/gi;
  while ((match = linkRegex.exec(content)) !== null) {
    const rawHref = match[1];
    const href = rawHref.split('?')[0];
    if (href.startsWith('http') || href.startsWith('data:') || href.includes('fonts.googleapis') || href.startsWith('//')) continue;
    const resolved = path.resolve(baseDir, href);
    if (!fs.existsSync(resolved)) {
      console.error(`  [FAIL link] ${relName} -> ${rawHref} NOT FOUND`);
      errors++;
    } else {
      console.log(`  [OK link] ${rawHref}`);
    }
  }

  // 3. Check duplicate IDs
  const idRegex = /\bid=["']([^"']+)["']/gi;
  const seenIds = new Set();
  const dupes = new Set();
  while ((match = idRegex.exec(content)) !== null) {
    const id = match[1];
    if (seenIds.has(id)) dupes.add(id);
    seenIds.add(id);
  }
  if (dupes.size > 0) {
    console.error(`  [FAIL duplicate IDs] in ${file}: ${[...dupes].join(', ')}`);
    errors++;
  } else {
    console.log(`  [OK IDs] ${seenIds.size} unique IDs`);
  }
}

console.log(`\n======================================================`);
console.log(`Asset Integrity Summary: ${errors === 0 ? 'All OK (0 errors)' : `${errors} errors found`}`);
console.log(`======================================================\n`);

if (errors > 0) {
  process.exit(1);
}
