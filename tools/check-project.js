const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));
let errors = 0;

for (const file of htmlFiles) {
  const filePath = path.join(rootDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`\n--- Checking ${file} ---`);

  // Check script tags
  const scriptRegex = /<script[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = scriptRegex.exec(content)) !== null) {
    const rawSrc = match[1];
    const src = rawSrc.split('?')[0];
    if (src.startsWith('http') || src.startsWith('//')) continue;
    const resolved = path.resolve(rootDir, src);
    if (!fs.existsSync(resolved)) {
      console.error(`  [FAIL script] ${file} -> ${rawSrc} NOT FOUND`);
      errors++;
    } else {
      console.log(`  [OK script] ${rawSrc}`);
    }
  }

  // Check stylesheet links
  const linkRegex = /<link[^>]+href=["']([^"']+)["'][^>]*>/gi;
  while ((match = linkRegex.exec(content)) !== null) {
    const rawHref = match[1];
    const href = rawHref.split('?')[0];
    if (href.startsWith('http') || href.startsWith('data:') || href.includes('fonts.googleapis') || href.startsWith('//')) continue;
    const resolved = path.resolve(rootDir, href);
    if (!fs.existsSync(resolved)) {
      console.error(`  [FAIL link] ${file} -> ${href} NOT FOUND`);
      errors++;
    } else {
      console.log(`  [OK link] ${href}`);
    }
  }

  // Check duplicate IDs
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

console.log(`\n========================================`);
console.log(`Summary: Total errors found = ${errors}`);
console.log(`========================================\n`);

process.exit(errors > 0 ? 1 : 0);
